'use strict';

const { Router } = require('express');
const authRoutes = require('../modules/auth/auth.routes');
const billsRoutes = require('../modules/bills/bills.routes');

const router = Router();

router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Splitbill API is running',
    data: { status: 'ok', timestamp: new Date().toISOString() },
  });
});

router.use('/auth', authRoutes);
router.use('/bills', billsRoutes);

module.exports = router;
