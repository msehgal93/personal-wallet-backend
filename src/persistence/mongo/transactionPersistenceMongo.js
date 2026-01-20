const Transaction = require('../../models/Transaction');
const TransactionPersistence = require('../interfaces/transactionPersistence');

class TransactionPersistenceMongo extends TransactionPersistence {
  async create(transactionData, options = {}) {
    return Transaction.create([{ ...transactionData }], { session: options.session }).then(
      (res) => res[0]
    );
  }

  async findByFilters(filters = {}, pagination = {}, options = {}) {
    const { skip = 0, limit = 50, sort = { createdAt: -1 } } = pagination;
    return Transaction.find(filters, null, {
      skip,
      limit,
      sort,
      session: options.session,
    });
  }

  async countByFilters(filters = {}, options = {}) {
    return Transaction.countDocuments(filters, { session: options.session });
  }

  async findById(id, options = {}) {
    return Transaction.findById(id, null, { session: options.session });
  }
}

module.exports = TransactionPersistenceMongo;
