const express = require('express');
const walletRoutes = require('./walletRoutes');
const transactionRoutes = require('./transactionRoutes');

const router = express.Router();

router.use('/wallet', walletRoutes);
router.use('/transaction', transactionRoutes);

module.exports = router;
