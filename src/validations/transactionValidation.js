const Joi = require('joi');

const transactionValidation = {
  createTransaction: Joi.object({
    params: Joi.object({
      walletId: Joi.string().required(),
    }),
    body: Joi.object({
      amount: Joi.number().required(),
      description: Joi.string().trim().required(),
    }),
  }),

  getTransactions: Joi.object({
    query: Joi.object({
      walletId: Joi.string().optional(),
      skip: Joi.number().integer().min(0).optional(),
      limit: Joi.number().integer().min(1).max(100).optional(),
      sortBy: Joi.string().valid('date', 'amount').optional(),
      sortOrder: Joi.string().valid('asc', 'desc').optional(),
    }),
  }),
};

module.exports = { transactionValidation };
