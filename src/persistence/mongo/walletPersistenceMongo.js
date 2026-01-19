const Wallet = require('../../models/Wallet');
const WalletPersistence = require('../interfaces/walletPersistence');

class WalletPersistenceMongo extends WalletPersistence {
  async create(walletData, options = {}) {
    return Wallet.create([{ ...walletData }], { session: options.session }).then((res) => res[0]);
  }

  async findById(id, options = {}) {
    return Wallet.findById(id, null, { session: options.session });
  }

  async updateBalance(id, newBalance, options = {}) {
    return Wallet.findByIdAndUpdate(
      id,
      { balance: newBalance },
      { new: true, session: options.session, runValidators: true }
    );
  }
}

module.exports = WalletPersistenceMongo;
