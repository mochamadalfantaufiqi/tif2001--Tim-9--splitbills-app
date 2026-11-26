'use strict';

const Sentry = require('@sentry/node');
const env = require('./env');

function initSentry() {
  if (!env.SENTRY_DSN) {
    return; // no-op when DSN is not configured
  }
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    tracesSampleRate: 0.2,
  });
}

module.exports = { initSentry, Sentry };
