const transactionService = require('../services/transactionService');
const { HTTP_STATUS } = require('../utils/constants');

class TransactionController {
  async createTransaction(req, res, next) {
    try {
      const { walletId } = req.params;
      const { amount, description } = req.body;

      const { transaction, wallet } = await transactionService.createTransaction(walletId, {
        amount,
        description,
      });

      return res.status(HTTP_STATUS.CREATED).json({
        balance: Number(wallet.balance.toFixed(4)),
        amount: Number(transaction.amount.toFixed(4)),
        description,
        transactionId: transaction._id,
        walletId,
        type: transaction.type,
      });
    } catch (error) {
      return next(error);
    }
  }

  async getTransactions(req, res, next) {
    try {
      const { walletId, skip, limit, sortBy, sortOrder } = req.query;
      const transactions = await transactionService.getTransactions(
        { walletId },
        {
          skip: skip ? Number(skip) : 0,
          limit: limit ? Number(limit) : 50,
          sortBy,
          sortOrder,
        }
      );

      const mappedTransactions = transactions.map((txn) => ({
        id: txn._id,
        walletId: txn.walletId,
        amount: Number(txn.amount.toFixed(4)),
        balance: Number(txn.balance.toFixed(4)),
        description: txn.description,
        date: txn.createdAt,
        type: txn.type,
      }));

      return res.status(HTTP_STATUS.OK).json({
        data: mappedTransactions,
        pagination: {
          skip: skip ? Number(skip) : 0,
          limit: limit ? Number(limit) : 50,
        },
      });
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = new TransactionController();
