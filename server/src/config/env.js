'use strict';

require('dotenv').config();

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  CORS_ORIGINS: (process.env.CORS_ORIGINS || 'http://localhost:5173').split(','),
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY || '',
  SUPABASE_BUCKET: process.env.SUPABASE_BUCKET || 'receipts',
  SENTRY_DSN: process.env.SENTRY_DSN || '',
};

if (!env.DATABASE_URL) {
  // eslint-disable-next-line no-console
  console.warn('[config] DATABASE_URL tidak diset – koneksi DB akan gagal');
}
if (!env.JWT_SECRET) {
  // eslint-disable-next-line no-console
  console.warn('[config] JWT_SECRET tidak diset – autentikasi akan gagal');
}

module.exports = env;
