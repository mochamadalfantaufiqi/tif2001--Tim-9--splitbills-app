'use strict';

const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').max(100, 'Nama maksimal 100 karakter').trim(),
  email: z.string().email('Format email tidak valid').toLowerCase().trim(),
  password: z.string().min(8, 'Password minimal 8 karakter'),
});

const loginSchema = z.object({
  email: z.string().email('Format email tidak valid').toLowerCase().trim(),
  password: z.string().min(1, 'Password wajib diisi'),
});

module.exports = { registerSchema, loginSchema };
