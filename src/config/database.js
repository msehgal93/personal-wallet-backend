const mongoose = require('mongoose');
const config = require('./config');
const logger = require('./logger');

const connect = async () => {
  try {
    await mongoose.connect(config.mongoose.url, config.mongoose.options);
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    throw error;
  }
};

const disconnect = async () => {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected');
  } catch (error) {
    logger.error('MongoDB disconnection error:', error);
    throw error;
  }
};

module.exports = {
  connect,
  disconnect,
};
