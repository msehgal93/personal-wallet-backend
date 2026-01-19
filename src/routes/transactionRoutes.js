const express = require('express');
const transactionController = require('../controllers/transactionController');
const { validate } = require('../middleware/validation');
const { transactionValidation } = require('../validations/transactionValidation');

const router = express.Router();

router.post(
  '/:walletId',
  validate(transactionValidation.createTransaction),
  transactionController.createTransaction
);
router.get(
  '/',
  validate(transactionValidation.getTransactions),
  transactionController.getTransactions
);

module.exports = router;
