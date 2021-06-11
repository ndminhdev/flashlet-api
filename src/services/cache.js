import { promisify } from 'util';
import mongoose from 'mongoose';
import redis from 'redis';
import { REDIS_PORT, REDIS_HOST } from '../utils/secrets';

const redisUrl = `redis://${REDIS_HOST}:${REDIS_PORT}`;
const client = redis.createClient(redisUrl);

client.hget = promisify(client.hget);

const cache = function (options = {}) {
  this.enableCache = true;
  this.key = options.key || 'defaultKey';
  this.field = options.field || 'defaultField';

  return this;
};

mongoose.Query.prototype.cache = cache;
mongoose.Aggregate.prototype.cache = cache;

const execute = (exec) => async function () {
  if (!this.enableCache) {
    console.log('Data source: Database');
    return exec.apply(this, arguments);
  }

  const cachedValue = await client.hget(this.key, this.field);

  if (cachedValue) {
    const parsedCache = JSON.parse(cachedValue);
    console.log('Data source: Cache');
    return parsedCache;
  }

  const result = await exec.apply(this, arguments);

  client.hmset(this.key, this.field, JSON.stringify(result), 'EX', 300);

  console.log('Data source: Database');
  return result;
};

mongoose.Query.prototype.exec = execute(mongoose.Query.prototype.exec);
mongoose.Aggregate.prototype.exec = execute(mongoose.Aggregate.prototype.exec);

export default {
  clearCache(key, field) {
    console.log('Cache cleaned');
    client.hdel(key, field);
  }
};

