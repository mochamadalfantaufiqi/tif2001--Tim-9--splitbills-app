'use strict';

const { Router } = require('express');
const billsController = require('./bills.controller');
const verifyToken = require('../../middlewares/verifyToken');
const validate = require('../../middlewares/validate');
const upload = require('../../middlewares/upload');
const { createBillSchema, updateBillSchema, listBillQuerySchema } = require('./bills.validation');

const router = Router();

// Semua route tagihan wajib terautentikasi
router.use(verifyToken);

router.get('/', validate(listBillQuerySchema, 'query'), billsController.list);
router.post('/', validate(createBillSchema), billsController.create);
router.get('/:id', billsController.getOne);
router.put('/:id', validate(updateBillSchema), billsController.update);
router.delete('/:id', billsController.remove);
router.post('/:id/receipt', upload, billsController.uploadReceipt);

module.exports = router;
