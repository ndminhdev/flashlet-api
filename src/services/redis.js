import redis from 'redis';
import { REDIS_PORT, REDIS_HOST } from '../utils/secrets';

// Redis server started on port REDIS_PORT
const client = redis.createClient(REDIS_PORT, REDIS_HOST);

export default client;
