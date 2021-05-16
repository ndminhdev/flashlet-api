import redis from 'redis';

// Redis server started on port 6379
const redisClient = redis.createClient(6379);

export default redisClient;
