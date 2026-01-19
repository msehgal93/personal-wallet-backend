const express = require('express');
const walletRoutes = require('./walletRoutes');
const transactionRoutes = require('./transactionRoutes');

const router = express.Router();

router.use('/wallet', walletRoutes);
router.use('/transact', transactionRoutes);
router.use('/transactions', transactionRoutes);

module.exports = router;
