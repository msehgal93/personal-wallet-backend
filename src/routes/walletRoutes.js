const express = require('express');
const walletController = require('../controllers/walletController');
const { validate } = require('../middleware/validation');
const { walletValidation } = require('../validations/walletValidation');

const router = express.Router();

router.post(
  '/setup',
  validate(walletValidation.initializeWallet),
  walletController.initializeWallet
);
router.get('/:id', validate(walletValidation.getWallet), walletController.getWallet);

module.exports = router;
