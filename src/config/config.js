// Load environment variables first, before any other imports
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

// Resolve path to project root
const rootPath = path.resolve(__dirname, '..');
const envPath = path.join(rootPath, '.env');

// Load .env.local if it exists (for local overrides), otherwise load .env
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  // Fallback to default behavior (looks in current working directory)
  dotenv.config();
}

const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  mongoose: {
    url: process.env.MONGODB_URL || 'mongodb://localhost:27017/wallet-management',
    options: {},
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 100,
  },
};

module.exports = config;
