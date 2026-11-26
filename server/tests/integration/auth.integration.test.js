'use strict';

/**
 * Integration test untuk endpoint autentikasi.
 * Database TIDAK digunakan – auth.repository.js di-mock penuh.
 */

const request = require('supertest');
const app = require('../../src/app');

// Mock seluruh modul repository agar tidak butuh koneksi DB
jest.mock('../../src/modules/auth/auth.repository', () => ({
  findByEmail: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
}));

const authRepo = require('../../src/modules/auth/auth.repository');
const bcrypt = require('bcryptjs');

const BASE = '/api/v1/auth';

describe('POST /auth/register', () => {
  beforeEach(() => jest.clearAllMocks());

  test('201 – registrasi berhasil', async () => {
    authRepo.findByEmail.mockResolvedValue(null);
    authRepo.create.mockResolvedValue({
      id: 'uuid-1',
      name: 'Andi',
      email: 'andi@test.com',
      role: 'user',
      created_at: new Date().toISOString(),
    });

    const res = await request(app).post(`${BASE}/register`).send({
      name: 'Andi',
      email: 'andi@test.com',
      password: 'Password123!',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user).not.toHaveProperty('password');
  });

  test('400 – email tidak valid', async () => {
    const res = await request(app).post(`${BASE}/register`).send({
      name: 'A',
      email: 'bukan-email',
      password: 'Password123!',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('400 – nama terlalu pendek', async () => {
    const res = await request(app).post(`${BASE}/register`).send({
      name: 'A',
      email: 'andi@test.com',
      password: 'Password123!',
    });
    expect(res.status).toBe(400);
  });

  test('400 – password kurang dari 8 karakter', async () => {
    const res = await request(app).post(`${BASE}/register`).send({
      name: 'Andi',
      email: 'andi@test.com',
      password: 'short',
    });
    expect(res.status).toBe(400);
  });

  test('409 – email sudah terdaftar', async () => {
    authRepo.findByEmail.mockResolvedValue({ id: 'existing' });

    const res = await request(app).post(`${BASE}/register`).send({
      name: 'Andi',
      email: 'andi@test.com',
      password: 'Password123!',
    });
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /auth/login', () => {
  beforeEach(() => jest.clearAllMocks());

  test('200 – login berhasil', async () => {
    const hashedPw = await bcrypt.hash('Password123!', 10);
    authRepo.findByEmail.mockResolvedValue({
      id: 'uuid-1',
      name: 'Andi',
      email: 'andi@test.com',
      role: 'user',
      password: hashedPw,
      created_at: new Date().toISOString(),
    });

    const res = await request(app).post(`${BASE}/login`).send({
      email: 'andi@test.com',
      password: 'Password123!',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user).not.toHaveProperty('password');
  });

  test('401 – email tidak ditemukan', async () => {
    authRepo.findByEmail.mockResolvedValue(null);

    const res = await request(app).post(`${BASE}/login`).send({
      email: 'nope@test.com',
      password: 'Password123!',
    });
    expect(res.status).toBe(401);
  });

  test('401 – password salah', async () => {
    const hashedPw = await bcrypt.hash('Password123!', 10);
    authRepo.findByEmail.mockResolvedValue({
      id: 'uuid-1',
      name: 'Andi',
      email: 'andi@test.com',
      role: 'user',
      password: hashedPw,
    });

    const res = await request(app).post(`${BASE}/login`).send({
      email: 'andi@test.com',
      password: 'WrongPassword!',
    });
    expect(res.status).toBe(401);
  });

  test('400 – body kosong', async () => {
    const res = await request(app).post(`${BASE}/login`).send({});
    expect(res.status).toBe(400);
  });
});

describe('GET /auth/me', () => {
  beforeEach(() => jest.clearAllMocks());

  test('401 – tanpa token', async () => {
    const res = await request(app).get(`${BASE}/me`);
    expect(res.status).toBe(401);
  });

  test('401 – token tidak valid', async () => {
    const res = await request(app)
      .get(`${BASE}/me`)
      .set('Authorization', 'Bearer token-tidak-valid');
    expect(res.status).toBe(401);
  });
});
