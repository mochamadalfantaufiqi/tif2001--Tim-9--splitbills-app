'use strict';

const AppError = require('../../utils/AppError');
const billsRepository = require('./bills.repository');
const { createClient } = require('@supabase/supabase-js');
const env = require('../../config/env');

function getSupabase() {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) { return null; }
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);
}

async function listBills({ ownerId, search, status, page, limit }) {
  return billsRepository.findAll({ ownerId, search, status, page, limit });
}

async function getBill(id, ownerId) {
  const bill = await billsRepository.findByIdAndOwner(id, ownerId);
  if (!bill) { throw new AppError('Tagihan tidak ditemukan', 404); }
  return bill;
}

async function createBill(ownerId, data) {
  return billsRepository.create({ ownerId, ...data });
}

async function updateBill(id, ownerId, data) {
  const bill = await billsRepository.update(id, ownerId, data);
  if (!bill) { throw new AppError('Tagihan tidak ditemukan atau bukan milik Anda', 404); }
  return bill;
}

async function deleteBill(id, ownerId) {
  const deleted = await billsRepository.remove(id, ownerId);
  if (!deleted) { throw new AppError('Tagihan tidak ditemukan atau bukan milik Anda', 404); }
}

async function uploadReceipt(id, ownerId, file) {
  // Verifikasi kepemilikan terlebih dahulu
  const bill = await billsRepository.findByIdAndOwner(id, ownerId);
  if (!bill) { throw new AppError('Tagihan tidak ditemukan atau bukan milik Anda', 403); }

  const supabase = getSupabase();
  if (!supabase) { throw new AppError('Storage belum dikonfigurasi', 503); }

  const path = `${id}/${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`;
  const { error } = await supabase.storage
    .from(env.SUPABASE_BUCKET)
    .upload(path, file.buffer, { contentType: file.mimetype });
  if (error) { throw new AppError('Gagal mengunggah gambar ke storage', 502); }

  const { data: urlData } = supabase.storage.from(env.SUPABASE_BUCKET).getPublicUrl(path);
  const receiptUrl = urlData.publicUrl;

  await billsRepository.updateReceiptUrl(id, ownerId, receiptUrl);
  return receiptUrl;
}

module.exports = { listBills, getBill, createBill, updateBill, deleteBill, uploadReceipt };
