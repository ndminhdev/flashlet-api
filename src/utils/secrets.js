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
  logger.error('No reset password jwt secret key. Please set RESET_PASSWORD_SECRET.');
  process.exit(1);
}

export const SALT_ROUNDS = process.env.SALT_ROUNDS || 10;

if (!SALT_ROUNDS) {
  logger.debug('No bcrypt salt rounds. Use default value "10" instead.');
}

// uri
const MONGO_HOST = process.env.MONGO_HOST || 'localhost';
const MONGO_PORT = process.env.MONGO_PORT || 27017;
const MONGO_DB = process.env.MONGO_DB;

if (!MONGO_DB) {
  logger.error('No mongodb database name. Please set MONGO_DB');
  process.exit(1);
}

export const MONGO_URI = `mongodb://${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}`;

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

// redis configurations
export const REDIS_PORT = process.env.REDIS_PORT || 6379;
export const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
