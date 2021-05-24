import { promisify } from 'util';
import redis from 'redis';
import { REDIS_PORT, REDIS_HOST } from '../utils/secrets';

// Redis server started on port REDIS_PORT
const client = redis.createClient(REDIS_PORT, REDIS_HOST);

const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);

export default {
  getAsync,
  setAsync
};
