import mongoose from 'mongoose';
import logger from '../utils/logger';
import { MONGO_URI } from '../utils/secrets';

import generateSeed from '../database/seed';

const mongooseConnect = () => {
  return mongoose.connect(MONGO_URI, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
    .then(() => {
      logger.debug('MongoDB connected.');
      generateSeed().then(() => logger.debug('Generate database seeds'));
    })
    .catch((err) => {
      logger.error('Retry in 5 sec. Make sure MongoDB instance is running');
      logger.error(err.message);
      setTimeout(mongooseConnect, 5000);
    });
};

export default mongooseConnect;
