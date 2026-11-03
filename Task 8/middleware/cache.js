const Redis = require('ioredis');
const { redisOptions } = require('../config/redis');

const DEFAULT_TTL = parseInt(process.env.CACHE_TTL_SECONDS, 10) || 60;

let redisClient = null;

function getRedisClient() {
  if (!redisClient) {
    redisClient = new Redis(redisOptions);

    redisClient.on('error', (err) => {
      console.error('[Cache] Redis connection error:', err.message);
    });
  }
  return redisClient;
}

/**
 * Express middleware that caches JSON responses in Redis.
 */
function cacheMiddleware(ttlSeconds = DEFAULT_TTL) {
  const redis = getRedisClient();

  return async (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = `cache:${req.method}:${req.originalUrl}`;

    try {
      const cached = await redis.get(cacheKey);

      if (cached) {
        res.setHeader('X-Cache', 'HIT');
        return res.json(JSON.parse(cached));
      }

      const originalJson = res.json.bind(res);
      res.json = (body) => {
        res.setHeader('X-Cache', 'MISS');
        redis
          .setex(cacheKey, ttlSeconds, JSON.stringify(body))
          .catch((err) => console.error('[Cache] Write error:', err.message));
        return originalJson(body);
      };

      next();
    } catch (err) {
      console.error('[Cache] Read error:', err.message);
      next();
    }
  };
}

async function invalidateCache(keyOrPrefix) {
  const redis = getRedisClient();

  if (keyOrPrefix.includes('*')) {
    const keys = await redis.keys(keyOrPrefix);
    if (keys.length) await redis.del(...keys);
  } else {
    await redis.del(keyOrPrefix);
  }
}

module.exports = { cacheMiddleware, invalidateCache, getRedisClient };
