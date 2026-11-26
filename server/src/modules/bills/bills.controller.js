'use strict';

const asyncHandler = require('../../utils/asyncHandler');
const billsService = require('./bills.service');

const list = asyncHandler(async (req, res) => {
  const { search, status, page, limit } = req.query;
  const result = await billsService.listBills({
    ownerId: req.user.id,
    search,
    status,
    page,
    limit,
  });
  res.json({ success: true, message: 'Bills fetched successfully', ...result });
});

const getOne = asyncHandler(async (req, res) => {
  const bill = await billsService.getBill(req.params.id, req.user.id);
  res.json({ success: true, message: 'Bill fetched successfully', data: bill });
});

const create = asyncHandler(async (req, res) => {
  const bill = await billsService.createBill(req.user.id, req.body);
  res.status(201).json({ success: true, message: 'Bill created successfully', data: bill });
});

const update = asyncHandler(async (req, res) => {
  const bill = await billsService.updateBill(req.params.id, req.user.id, req.body);
  res.json({ success: true, message: 'Bill updated successfully', data: bill });
});

const remove = asyncHandler(async (req, res) => {
  await billsService.deleteBill(req.params.id, req.user.id);
  res.json({ success: true, message: 'Bill deleted successfully', data: null });
});

const uploadReceipt = asyncHandler(async (req, res) => {
  if (!req.file) { throw require('../../utils/AppError')('File receipt wajib diunggah', 400); }
  const receiptUrl = await billsService.uploadReceipt(req.params.id, req.user.id, req.file);
  res.json({ success: true, message: 'Receipt uploaded successfully', data: { receiptUrl } });
});

module.exports = { list, getOne, create, update, remove, uploadReceipt };
