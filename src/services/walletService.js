const { walletPersistence, transactionPersistence } = require('../persistence');
const { runInTransaction } = require('../persistence/mongo/util/transactionManager');
const { TRANSACTION_TYPES } = require('../utils/constants');
const { AppError } = require('../utils/errors');

const roundToFourDecimals = (value) => {
  if (value === undefined || value === null) return value;
  return Math.round(value * 10000) / 10000;
};

class WalletService {
  async createWallet({ balance, name }) {
    return runInTransaction(async (session) => {
      const roundedBalance = roundToFourDecimals(balance);
      const wallet = await walletPersistence.create({ balance: roundedBalance, name }, { session });

      const transaction = await transactionPersistence.create(
        {
          walletId: wallet._id,
          amount: roundedBalance,
          balance: roundedBalance,
          description: 'Initial wallet setup',
          type: TRANSACTION_TYPES.CREDIT,
        },
        { session }
      );

      return { wallet, transaction };
    });
  }

  async getWalletById(id) {
    const wallet = await walletPersistence.findById(id);
    if (!wallet) {
      throw new AppError('Wallet not found', 404);
    }
    return wallet;
  }

  async updateWalletBalance(id, newBalance, options = {}) {
    const updatedWallet = await walletPersistence.updateBalance(id, newBalance, {
      session: options.session,
    });
    if (!updatedWallet) {
      throw new AppError('Failed to update wallet balance', 500);
    }
    return updatedWallet;
  }
}

module.exports = new WalletService();
