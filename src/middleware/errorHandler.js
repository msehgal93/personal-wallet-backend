const logger = require('../config/logger');
const { HTTP_STATUS } = require('../utils/constants');
const { AppError } = require('../utils/errors');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  if (err.name === 'ValidationError') {
    error = new AppError('Validation error', HTTP_STATUS.BAD_REQUEST);
  }

  if (err.name === 'CastError') {
    // Hide internal cast error details and respond with 400
    error = new AppError('Resource not found', HTTP_STATUS.BAD_REQUEST);
  }

  if (err.code === 11000) {
    error = new AppError('Duplicate key error', HTTP_STATUS.BAD_REQUEST);
  }

  logger.error(err);

  res.status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    error: error.message || 'Server Error',
  });
};

module.exports = { errorHandler };
