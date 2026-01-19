const { walletPersistence, transactionPersistence } = require('../persistence');
const { runInTransaction } = require('../persistence/mongo/util/transactionManager');
const { TRANSACTION_TYPES } = require('../utils/constants');
const { AppError } = require('../utils/errors');

const roundToFourDecimals = (value) => {
  if (value === undefined || value === null) return value;
  return Math.round(value * 10000) / 10000;
};

class TransactionService {
  async createTransaction(walletId, { amount, description }) {
    if (amount === 0) {
      throw new AppError('Amount must be non-zero', 400);
    }

    return runInTransaction(async (session) => {
      const wallet = await walletPersistence.findById(walletId, { session });
      if (!wallet) {
        throw new AppError('Wallet not found', 404);
      }

      const transactionType = amount > 0 ? TRANSACTION_TYPES.CREDIT : TRANSACTION_TYPES.DEBIT;
      const normalizedAmount = roundToFourDecimals(Math.abs(amount));
      const newBalance = roundToFourDecimals(
        transactionType === TRANSACTION_TYPES.CREDIT
          ? wallet.balance + normalizedAmount
          : wallet.balance - normalizedAmount
      );

      if (newBalance < 0) {
        throw new AppError('Insufficient balance for debit', 400);
      }

      const updatedWallet = await walletPersistence.updateBalance(walletId, newBalance, {
        session,
      });

      const transaction = await transactionPersistence.create(
        {
          walletId,
          amount: normalizedAmount,
          balance: updatedWallet.balance,
          description,
          type: transactionType,
        },
        { session }
      );

      return { transaction, wallet: updatedWallet };
    });
  }

  async getTransactions(filters, pagination) {
    const parsedFilters = {};
    if (filters.walletId) {
      parsedFilters.walletId = filters.walletId;
    }

    const { skip = 0, limit = 50, sortBy, sortOrder } = pagination || {};

    let sortField = 'createdAt';
    if (sortBy === 'amount') {
      sortField = 'amount';
    }

    const sortDirection =
      sortOrder === 'asc' || sortOrder === 1
        ? 1
        : sortOrder === 'desc' || sortOrder === -1
          ? -1
          : -1;

    const sort = { [sortField]: sortDirection };

    return transactionPersistence.findByFilters(parsedFilters, { skip, limit, sort });
  }

  async getTransactionById(id) {
    const transaction = await transactionPersistence.findById(id);
    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }
    return transaction;
  }
}

module.exports = new TransactionService();
