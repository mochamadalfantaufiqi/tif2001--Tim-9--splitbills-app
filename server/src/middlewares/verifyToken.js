'use strict';

const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const env = require('../config/env');

/**
 * Middleware: verifikasi Bearer JWT, isi req.user = { id, role }.
 */
module.exports = (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return next(new AppError('Token tidak ditemukan', 401));
  }
  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    req.user = { id: payload.sub, role: payload.role };
    return next();
  } catch (_e) {
    return next(new AppError('Token tidak valid atau kedaluwarsa', 401));
  }
};
