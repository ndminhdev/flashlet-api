import fs from 'fs';
import dotenv from 'dotenv';
import logger from './logger';

if (fs.existsSync('.env.production')) {
  logger.debug('Using .env.production for environment variables');
  dotenv.config({ path: '.env.production' });
} else {
  logger.debug('Using .env.development for environment variables');
  dotenv.config({ path: '.env.development' });
}

// dev server
export const PORT = process.env.PORT || 8080;

if (!PORT) {
  logger.debug('No port. Use default port 8080 instead.');
}

// modes
export const mode = process.env.NODE_ENV;
export const isProd = mode === 'production';

// secrets
export const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  logger.error('No client jwt secret key. Please set JWT_SECRET.');
  process.exit(1);
}

export const RESET_PASSWORD_SECRET = process.env.RESET_PASSWORD_SECRET;

if (!RESET_PASSWORD_SECRET) {
  logger.error(
    'No reset password jwt secret key. Please set RESET_PASSWORD_SECRET.'
  );
  process.exit(1);
}

export const SALT_ROUNDS = process.env.SALT_ROUNDS || 10;

if (!SALT_ROUNDS) {
  logger.debug('No bcrypt salt rounds. Use default value "10" instead.');
}

// uri
export const MONGO_URI = isProd
  ? process.env.MONGO_URI
  : process.env.MONGO_URI_LOCAL;

if (!MONGO_URI) {
  if (isProd) {
    logger.error('No MongoDB connection string. Please set MONGO_URI.');
  } else {
    logger.error('No MongoDB connection string. Please set MONGO_URI_LOCAL.');
  }
  process.exit(1);
}

// sendgrid api key
export const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

if (!SENDGRID_API_KEY) {
  logger.error('No sendgrid api key. Please set SENDGRID_API_KEY.');
  process.exit(1);
}

// cloudinary configurations
export const CLOUD_NAME = process.env.CLOUD_NAME;
export const CLOUD_KEY = process.env.CLOUD_KEY;
export const CLOUD_SECRET = process.env.CLOUD_SECRET;

if (!CLOUD_NAME || !CLOUD_KEY || !CLOUD_SECRET) {
  logger.error('Missing cloudinary configs. Please set them.');
  process.exit(1);
}

// oxford dictionary api
export const OXFORD_BASE_URL = process.env.OXFORD_BASE_URL;
export const OXFORD_APP_ID = process.env.OXFORD_APP_ID;
export const OXFORD_APP_KEY = process.env.OXFORD_APP_KEY;

if (!OXFORD_BASE_URL || !OXFORD_APP_ID || !OXFORD_APP_KEY) {
  logger.error('Missing oxford dictionary api configs. Please set them.');
  process.exit(1);
}
