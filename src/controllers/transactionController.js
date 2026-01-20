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
      const { walletId, sortBy, sortOrder } = req.query;
      const hasSkip = req.query.skip !== undefined;
      const hasLimit = req.query.limit !== undefined;
      const bothMissing = !hasSkip && !hasLimit;

      const skip = hasSkip ? Number(req.query.skip) : 0;
      const limit = hasLimit ? Number(req.query.limit) : bothMissing ? 10 : 10;

      const transactions = await transactionService.getTransactions(
        { walletId },
        { skip, limit, sortBy, sortOrder }
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

      if (!bothMissing) {
        // If client is paginating (skip/limit provided), return only transactions array
        return res.status(HTTP_STATUS.OK).json(mappedTransactions);
      }

      const count = await transactionService.countTransactions({ walletId });
      return res.status(HTTP_STATUS.OK).json({
        transactions: mappedTransactions,
        pagination: {
          skip: 0,
          limit: 10,
          count,
        },
      });
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = new TransactionController();
