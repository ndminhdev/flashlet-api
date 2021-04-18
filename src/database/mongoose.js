import mongoose from 'mongoose';
import logger from '../utils/logger';
import { MONGO_URI } from '../utils/secrets';

import generateSeed from './seed';

mongoose
  .connect(MONGO_URI, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    logger.debug('MongoDB connected.');
    return generateSeed();
  })
  .then(() => {
    console.log('Database seeds has been generated');
  })
  .catch(() => {
    logger.error('MongoDB connection failed. Make sure MongoDB instance is running.');
  });
