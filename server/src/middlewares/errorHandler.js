'use strict';

const { Sentry } = require('../config/sentry');

// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
  const status = err.statusCode || 500;
  if (status >= 500) {
    // eslint-disable-next-line no-console
    console.error('[error]', err);
    Sentry.captureException(err);
  }
  res.status(status).json({
    success: false,
    message: status >= 500 ? 'Terjadi kesalahan pada server' : err.message,
    errors: err.errors || [],
  });
};
