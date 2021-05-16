import mongoose from 'mongoose';
import logger from '../utils/logger';
import { mode, MONGO_URI } from '../utils/secrets';

import generateSeed from '../database/seed';

const mongooseConnect = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    logger.debug('MongoDB connected.');

    if (mode !== 'production') {
      await generateSeed();
      logger.debug('Generate database seeds');
    }
  } catch (err) {
    logger.error('Make sure MongoDB instance is running');
    logger.error(err.message);
  }
};

export default mongooseConnect;
