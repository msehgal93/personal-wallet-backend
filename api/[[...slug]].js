const app = require('../src/app');
const database = require('../src/config/database');
const logger = require('../src/config/logger');

module.exports = async (req, res) => {
  try {
    await database.connect();
    return app(req, res);
  } catch (error) {
    logger.error('Failed to handle request', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};
