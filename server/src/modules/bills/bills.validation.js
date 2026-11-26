'use strict';

const { z } = require('zod');

const createBillSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi').max(120, 'Judul maksimal 120 karakter').trim(),
  venueName: z.string().max(120).trim().optional(),
  billDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal: YYYY-MM-DD').optional(),
  taxMode: z.enum(['percent', 'nominal']).default('percent'),
  taxValue: z.number().min(0, 'Nilai pajak tidak boleh negatif').default(10),
  serviceMode: z.enum(['percent', 'nominal']).default('percent'),
  serviceValue: z.number().min(0).default(0),
  serviceSplit: z.enum(['proportional', 'equal']).default('proportional'),
});

const updateBillSchema = createBillSchema.partial();

const listBillQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: z.enum(['draft', 'finalized']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

module.exports = { createBillSchema, updateBillSchema, listBillQuerySchema };
