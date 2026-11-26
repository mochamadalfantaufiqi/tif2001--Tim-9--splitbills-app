'use strict';

const pool = require('../../config/db');

async function findAll({ ownerId, search, status, page = 1, limit = 10 }) {
  const params = [ownerId];
  let where = 'WHERE owner_id = $1';

  if (search) {
    params.push(`%${search}%`);
    where += ` AND (title ILIKE $${params.length} OR venue_name ILIKE $${params.length})`;
  }
  if (status) {
    params.push(status);
    where += ` AND status = $${params.length}`;
  }

  const offset = (page - 1) * limit;
  const countRes = await pool.query(
    `SELECT COUNT(*)::int AS total FROM bills ${where}`,
    params,
  );
  const rows = await pool.query(
    `SELECT id, title, venue_name, bill_date, status, created_at
     FROM bills ${where}
     ORDER BY created_at DESC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset],
  );

  const totalRows = countRes.rows[0].total;
  const totalPages = Math.ceil(totalRows / limit) || 1;
  return { rows: rows.rows, meta: { totalRows, totalPages, currentPage: page } };
}

async function findByIdAndOwner(id, ownerId) {
  const { rows } = await pool.query(
    `SELECT b.*,
       COALESCE(json_agg(DISTINCT jsonb_build_object(
         'id', p.id, 'name', p.name, 'sort_order', p.sort_order
       )) FILTER (WHERE p.id IS NOT NULL), '[]') AS participants,
       COALESCE(json_agg(DISTINCT jsonb_build_object(
         'id', i.id, 'name', i.name, 'price', i.price, 'qty', i.qty
       )) FILTER (WHERE i.id IS NOT NULL), '[]') AS items
     FROM bills b
     LEFT JOIN participants p ON p.bill_id = b.id
     LEFT JOIN bill_items i ON i.bill_id = b.id
     WHERE b.id = $1 AND b.owner_id = $2
     GROUP BY b.id`,
    [id, ownerId],
  );
  return rows[0] || null;
}

async function create({ ownerId, title, venueName, billDate, taxMode, taxValue, serviceMode, serviceValue, serviceSplit }) {
  const { rows } = await pool.query(
    `INSERT INTO bills (owner_id, title, venue_name, bill_date, tax_mode, tax_value,
                        service_mode, service_value, service_split)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING *`,
    [ownerId, title, venueName || null, billDate || null, taxMode, taxValue, serviceMode, serviceValue, serviceSplit],
  );
  return rows[0];
}

async function update(id, ownerId, fields) {
  const keys = Object.keys(fields);
  if (!keys.length) { return findByIdAndOwner(id, ownerId); }

  const colMap = {
    title: 'title', venueName: 'venue_name', billDate: 'bill_date',
    taxMode: 'tax_mode', taxValue: 'tax_value', serviceMode: 'service_mode',
    serviceValue: 'service_value', serviceSplit: 'service_split',
  };

  const setClauses = keys.map((k, idx) => `${colMap[k]} = $${idx + 1}`).join(', ');
  const values = keys.map((k) => fields[k]);
  values.push(id, ownerId);

  const { rows } = await pool.query(
    `UPDATE bills SET ${setClauses}, updated_at = CURRENT_TIMESTAMP
     WHERE id = $${values.length - 1} AND owner_id = $${values.length}
     RETURNING *`,
    values,
  );
  return rows[0] || null;
}

async function remove(id, ownerId) {
  const { rowCount } = await pool.query(
    'DELETE FROM bills WHERE id = $1 AND owner_id = $2',
    [id, ownerId],
  );
  return rowCount > 0;
}

async function updateReceiptUrl(id, ownerId, receiptUrl) {
  const { rows } = await pool.query(
    `UPDATE bills SET receipt_url = $1, updated_at = CURRENT_TIMESTAMP
     WHERE id = $2 AND owner_id = $3
     RETURNING id, receipt_url`,
    [receiptUrl, id, ownerId],
  );
  return rows[0] || null;
}

module.exports = { findAll, findByIdAndOwner, create, update, remove, updateReceiptUrl };
