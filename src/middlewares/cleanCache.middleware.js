import { clearCache } from '../services/cache';

const cleanCache = async (req, resp, next) => {
  await next();
  clearCache(req.body.user);
};

export default cleanCache;