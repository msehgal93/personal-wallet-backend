const fs = require('fs');
const path = require('path');
const winston = require('winston');
const config = require('./config');

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_REGION || process.env.FUNCTION_NAME);

const transports = [];

if (!isServerless) {
  const logDir = path.resolve(process.cwd(), 'logs');

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  transports.push(
    new winston.transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' })
  );
  transports.push(new winston.transports.File({ filename: path.join(logDir, 'combined.log') }));
}

if (isServerless || config.env !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: isServerless
        ? winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            winston.format.json()
          )
        : winston.format.combine(winston.format.colorize(), winston.format.simple()),
    })
  );
}

const logger = winston.createLogger({
  level: config.env === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'wallet-management-service' },
  transports,
});

module.exports = logger;
