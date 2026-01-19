const config = require('./config/config');
const app = require('./app');
const logger = require('./config/logger');
const database = require('./config/database');

const startServer = async () => {
  try {
    await database.connect();
    app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
