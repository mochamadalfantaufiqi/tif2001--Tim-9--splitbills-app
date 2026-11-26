'use strict';

/**
 * scripts/migrate.js
 * Menjalankan semua file SQL di server/migrations/ secara berurutan.
 * Gunakan: node scripts/migrate.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function migrate() {
  const migrationsDir = path.join(__dirname, '..', 'migrations');
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  // Buat tabel migrasi jika belum ada
  await pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id         SERIAL PRIMARY KEY,
      filename   VARCHAR(200) UNIQUE NOT NULL,
      applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  for (const file of files) {
    const { rows } = await pool.query('SELECT 1 FROM _migrations WHERE filename = $1', [file]);
    if (rows.length) {
      // eslint-disable-next-line no-console
      console.log(`[migrate] skip  ${file} (sudah diterapkan)`);
      continue;
    }
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    await pool.query(sql);
    await pool.query('INSERT INTO _migrations (filename) VALUES ($1)', [file]);
    // eslint-disable-next-line no-console
    console.log(`[migrate] apply ${file} ✓`);
  }

  await pool.end();
  // eslint-disable-next-line no-console
  console.log('[migrate] selesai');
}

migrate().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[migrate] ERROR:', err.message);
  process.exit(1);
});
