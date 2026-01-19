const logger = require('../config/logger');
const { AppError } = require('../utils/errors');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  if (err.name === 'ValidationError') {
    // Handle Mongoose validation errors
  }

  if (err.name === 'CastError') {
    // Handle Mongoose cast errors
  }

  if (err.code === 11000) {
    // Handle duplicate key errors
  }

  logger.error(err);

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
  });
};

module.exports = { errorHandler };
