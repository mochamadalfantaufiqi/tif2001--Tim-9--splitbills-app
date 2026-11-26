'use strict';

const pool = require('../../config/db');

/**
 * @param {string} email
 */
async function findByEmail(email) {
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email]);
  return rows[0] || null;
}

/**
 * @param {{ name:string, email:string, hashedPassword:string }} data
 */
async function create({ name, email, hashedPassword }) {
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, role, created_at`,
    [name, email, hashedPassword],
  );
  return rows[0];
}

/**
 * @param {string} id
 */
async function findById(id) {
  const { rows } = await pool.query(
    'SELECT id, name, email, role, created_at FROM users WHERE id = $1 LIMIT 1',
    [id],
  );
  return rows[0] || null;
}

module.exports = { findByEmail, create, findById };
