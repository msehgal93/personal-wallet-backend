const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = Wallet;
