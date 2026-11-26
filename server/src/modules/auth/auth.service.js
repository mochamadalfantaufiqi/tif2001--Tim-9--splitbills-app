'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AppError = require('../../utils/AppError');
const env = require('../../config/env');
const authRepository = require('./auth.repository');

/**
 * @param {{ name:string, email:string, password:string }} data
 */
async function register({ name, email, password }) {
  const existing = await authRepository.findByEmail(email);
  if (existing) {
    throw new AppError('Email sudah terdaftar', 409);
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await authRepository.create({ name, email, hashedPassword });
  const token = jwt.sign({ sub: user.id, role: user.role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
  return { user, token };
}

/**
 * @param {{ email:string, password:string }} data
 */
async function login({ email, password }) {
  const user = await authRepository.findByEmail(email);
  if (!user) {
    throw new AppError('Email atau kata sandi salah', 401);
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw new AppError('Email atau kata sandi salah', 401);
  }
  const token = jwt.sign({ sub: user.id, role: user.role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
  // Jangan kembalikan field password
  const { password: _pw, ...safeUser } = user;
  return { user: safeUser, token };
}

/**
 * @param {string} userId
 */
async function getMe(userId) {
  const user = await authRepository.findById(userId);
  if (!user) {
    throw new AppError('User tidak ditemukan', 404);
  }
  return user;
}

module.exports = { register, login, getMe };
