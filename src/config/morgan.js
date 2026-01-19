const morgan = require('morgan');
const logger = require('./logger');
const config = require('./config');

const stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

const skip = () => {
  return config.env === 'test';
};

const morganMiddleware = morgan('combined', {
  stream,
  skip,
});

module.exports = morganMiddleware;
