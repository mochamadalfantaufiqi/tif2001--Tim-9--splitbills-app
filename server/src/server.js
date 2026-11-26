'use strict';

const app = require('./app');
const pool = require('./config/db');
const env = require('./config/env');

const server = app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[server] Splitbill API running on port ${env.PORT} (${env.NODE_ENV})`);
});

// Graceful shutdown
const shutdown = async (signal) => {
  // eslint-disable-next-line no-console
  console.log(`[server] ${signal} received, shutting down gracefully…`);
  server.close(async () => {
    await pool.end();
    // eslint-disable-next-line no-console
    console.log('[server] DB pool closed. Bye.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = server;
