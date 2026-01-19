class WalletPersistence {
  async create(/* walletData, options */) {
    throw new Error('create not implemented');
  }

  async findById(/* id, options */) {
    throw new Error('findById not implemented');
  }

  async updateBalance(/* id, newBalance, options */) {
    throw new Error('updateBalance not implemented');
  }
}

module.exports = WalletPersistence;
