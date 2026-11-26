'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe('bcryptjs – password hashing', () => {
  const password = 'Password123!';
  let hash;

  beforeAll(async () => {
    hash = await bcrypt.hash(password, 10);
  });

  test('hash berbeda dari plaintext', () => {
    expect(hash).not.toBe(password);
  });

  test('hash dimulai dengan $2', () => {
    expect(hash).toMatch(/^\$2/);
  });

  test('compare benar untuk password yang sesuai', async () => {
    expect(await bcrypt.compare(password, hash)).toBe(true);
  });

  test('compare salah untuk password yang tidak sesuai', async () => {
    expect(await bcrypt.compare('wrong-password', hash)).toBe(false);
  });
});

describe('jsonwebtoken – token JWT', () => {
  const secret = 'test-secret-yang-cukup-panjang-32char!!';
  const payload = { sub: 'user-uuid-123', role: 'user' };

  test('sign dan verify berhasil', () => {
    const token = jwt.sign(payload, secret, { expiresIn: '1h' });
    const decoded = jwt.verify(token, secret);
    expect(decoded.sub).toBe(payload.sub);
    expect(decoded.role).toBe(payload.role);
  });

  test('token kedaluwarsa melempar error', () => {
    const token = jwt.sign(payload, secret, { expiresIn: '0s' });
    expect(() => jwt.verify(token, secret)).toThrow(jwt.TokenExpiredError);
  });

  test('token dengan secret salah melempar error', () => {
    const token = jwt.sign(payload, secret, { expiresIn: '1h' });
    expect(() => jwt.verify(token, 'wrong-secret')).toThrow(jwt.JsonWebTokenError);
  });
});
