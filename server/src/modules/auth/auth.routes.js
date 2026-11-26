'use strict';

const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('./auth.controller');
const verifyToken = require('../../middlewares/verifyToken');
const validate = require('../../middlewares/validate');
const { registerSchema, loginSchema } = require('./auth.validation');

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 10,
  message: { success: false, message: 'Terlalu banyak percobaan login, coba lagi 15 menit lagi' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', loginLimiter, validate(loginSchema), authController.login);
router.get('/me', verifyToken, authController.getMe);

module.exports = router;
