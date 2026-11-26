'use strict';

const multer = require('multer');
const AppError = require('../utils/AppError');

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

module.exports = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('Hanya file JPG, PNG, atau WEBP yang diizinkan', 400));
    }
  },
}).single('receipt');
