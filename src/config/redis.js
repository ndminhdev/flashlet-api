import { promisify } from 'util';
import redis from 'redis';

// Redis server started on port 6379
const client = redis.createClient(6379);

const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);

export default {
  getAsync,
  setAsync
};
