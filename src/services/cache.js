import { promisify } from 'util';
import mongoose from 'mongoose';
import redis from 'redis';
import { REDIS_PORT, REDIS_HOST } from '../utils/secrets';

const redisUrl = `redis://${REDIS_HOST}:${REDIS_PORT}`;
const client = redis.createClient(redisUrl);

client.hget = promisify(client.hget);

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function (options = {}) {
  this.enableCache = true;
  this.hashKey = JSON.stringify(options.key || 'default');

  return this;
};

mongoose.Query.prototype.exec = async function () {
  if (!this.enableCache) {
    console.log('Data source: Database');
    return exec.apply(this, arguments);
  }

  const key = JSON.stringify(Object.assign({}, this.getQuery(), {
    collection: this.mongooseCollection.name
  }));

  const cachedValue = await client.hget(this.hashKey, key);

  if (cachedValue) {
    const parsedCache = JSON.parse(cachedValue);
    console.log('Data source: Cache');
    return Array.isArray(parsedCache)
      ? parsedCache.map(doc => new this.model(doc))
      : new this.model(parsedCache);
  }

  const result = await exec.apply(this, arguments);

  client.hmset(this.hashKey, key, JSON.stringify(result), 'EX', 300);

  console.log('Data source: Database');
  return result;
};

export default {
  clearCache(hashKey) {
    console.log('Cache cleaned');
    client.del(JSON.stringify(hashKey));
  }
};

