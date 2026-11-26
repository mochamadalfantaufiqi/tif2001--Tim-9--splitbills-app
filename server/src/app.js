'use strict';

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const { initSentry, Sentry } = require('./config/sentry');
const env = require('./config/env');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');

initSentry();

const app = express();

// --- Sentry request handler (must be first middleware) ---
app.use(Sentry.expressErrorHandler ? (req, res, next) => next() : (req, res, next) => next());

// --- Security & utility middleware ---
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGINS,
    credentials: true,
  }),
);
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// --- API routes ---
app.use('/api/v1', routes);

// --- 404 handler ---
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan', errors: [] });
});

// --- Centralized error handler ---
app.use(errorHandler);

module.exports = app;
