import { cacheInstance } from './LRUCache.js';

export const cacheMiddleware = (keyGenerator, ttlInSeconds) => {
  return (req, res, next) => {
    // Only intercept GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Determine cache key
    let key;
    if (typeof keyGenerator === 'function') {
      key = keyGenerator(req);
    } else if (typeof keyGenerator === 'string') {
      key = keyGenerator;
    } else {
      key = req.originalUrl;
    }

    const start = performance.now();

    // Check cache
    const cachedData = cacheInstance.get(key);
    if (cachedData !== null) {
      const duration = (performance.now() - start).toFixed(3);
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('X-Response-Time', `${duration}ms`);
      return res.json(cachedData);
    }

    // Intercept res.json to store the response body in cache before replying
    const originalJson = res.json;
    res.json = function (body) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cacheInstance.set(key, body, ttlInSeconds);
      }

      const duration = (performance.now() - start).toFixed(3);
      res.setHeader('X-Cache', 'MISS');
      res.setHeader('X-Response-Time', `${duration}ms`);

      res.json = originalJson;
      return res.json.call(this, body);
    };

    next();
  };
};
