const WalletPersistenceMongo = require('./mongo/walletPersistenceMongo');
const TransactionPersistenceMongo = require('./mongo/transactionPersistenceMongo');

const walletPersistence = new WalletPersistenceMongo();
const transactionPersistence = new TransactionPersistenceMongo();

module.exports = {
  walletPersistence,
  transactionPersistence,
};
