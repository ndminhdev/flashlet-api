import mongoose from 'mongoose';
import logger from '../utils/logger';
import { MONGO_URI } from '../utils/secrets';

mongoose
  .connect(MONGO_URI, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    logger.debug('MongoDB connected.');
  })
  .catch(() => {
    logger.error('MongoDB connection failed. Make sure MongoDB instance is running.');
  });
