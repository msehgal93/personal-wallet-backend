const Joi = require('joi');

const walletValidation = {
  initializeWallet: Joi.object({
    body: Joi.object({
      balance: Joi.number().min(0).required(),
      name: Joi.string().trim().required(),
    }),
  }),

  getWallet: Joi.object({
    params: Joi.object({
      id: Joi.string().required(),
    }),
  }),
};

module.exports = { walletValidation };
