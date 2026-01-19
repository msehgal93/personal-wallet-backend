const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');

class TransactionService {
  async createTransaction(walletId, data) {}

  async getTransactions(filters, pagination) {}

  async getTransactionById(id) {}
}

module.exports = new TransactionService();
