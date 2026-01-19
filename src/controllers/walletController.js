const walletService = require('../services/walletService');
const { HTTP_STATUS } = require('../utils/constants');

class WalletController {
  async initializeWallet(req, res, next) {
    try {
      const { balance, name } = req.body;
      const { wallet, transaction } = await walletService.createWallet({ balance, name });

      return res.status(HTTP_STATUS.CREATED).json({
        id: wallet._id,
        balance: Number(wallet.balance.toFixed(4)),
        transactionId: transaction._id,
        name: wallet.name,
        date: wallet.createdAt,
      });
    } catch (error) {
      return next(error);
    }
  }

  async getWallet(req, res, next) {
    try {
      const { id } = req.params;
      const wallet = await walletService.getWalletById(id);
      return res.status(HTTP_STATUS.OK).json({
        id: wallet._id,
        balance: Number(wallet.balance.toFixed(4)),
        name: wallet.name,
        date: wallet.createdAt,
      });
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = new WalletController();
