const { HTTP_STATUS } = require('../utils/constants');

// eslint-disable-next-line no-unused-vars
const notFoundHandler = (req, res, next) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    error: 'Route not found',
  });
};

module.exports = { notFoundHandler };
