class TransactionPersistence {
  async create(/* transactionData, options */) {
    throw new Error('create not implemented');
  }

  async findByFilters(/* filters, pagination, options */) {
    throw new Error('findByFilters not implemented');
  }

  async countByFilters(/* filters, options */) {
    throw new Error('countByFilters not implemented');
  }

  async findById(/* id, options */) {
    throw new Error('findById not implemented');
  }
}

module.exports = TransactionPersistence;
