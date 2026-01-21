const app = require('../src/app');
const database = require('../src/config/database');
const logger = require('../src/config/logger');

const normalizeUrl = (url = '/') => {
  const [pathname, search] = url.split('?');
  const ensuredPath = pathname.startsWith('/api')
    ? pathname
    : pathname.startsWith('/')
    ? `/api${pathname}`
    : `/api/${pathname}`;

  return search ? `${ensuredPath}?${search}` : ensuredPath;
};

module.exports = async (req, res) => {
  try {
    await database.connect();

    req.url = normalizeUrl(req.url);
    logger.info({ message: 'Incoming request', method: req.method, url: req.url });

    return app(req, res);
  } catch (error) {
    logger.error('Failed to handle request', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};
