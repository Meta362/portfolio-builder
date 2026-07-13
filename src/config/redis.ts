// src/config/redis.ts
import Redis from 'ioredis';
import logger from './logger';

let redisClient: Redis | null = null;
let isRedisEnabled = true;

export const getRedisClient = (): Redis | null => {
  // If Redis is disabled, return null
  if (!isRedisEnabled) {
    return null;
  }

  if (!redisClient) {
    const redisUrl = process.env.REDIS_URL;
    
    // If no Redis URL, disable Redis
    if (!redisUrl) {
      logger.warn('⚠️ REDIS_URL not found. Redis disabled.');
      isRedisEnabled = false;
      return null;
    }

    try {
      // Validate URL
      new URL(redisUrl); // This will throw if invalid
      
      redisClient = new Redis(redisUrl, {
        retryStrategy: (times: number) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        connectTimeout: 10000,
        lazyConnect: false,
      });

      redisClient.on('connect', () => {
        logger.info('✅ Redis connected successfully');
      });

      redisClient.on('error', (error: Error) => {
        logger.error('❌ Redis error:', error.message);
        // Don't crash the app on Redis errors
      });

      redisClient.on('close', () => {
        logger.warn('⚠️ Redis connection closed');
      });

    } catch (error) {
      logger.error('❌ Invalid Redis URL:', (error as Error).message);
      logger.warn('⚠️ Redis disabled due to invalid configuration');
      isRedisEnabled = false;
      return null;
    }
  }

  return redisClient;
};

export const closeRedisConnection = async (): Promise<void> => {
  if (redisClient) {
    try {
      await redisClient.quit();
      redisClient = null;
      logger.info('Redis connection closed');
    } catch (error) {
      logger.error('Error closing Redis connection:', error);
    }
  }
};

// Helper function to check if Redis is available
export const isRedisAvailable = (): boolean => {
  return isRedisEnabled && redisClient !== null;
};

// Helper function to get or set cache
export const cacheGetOrSet = async <T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlSeconds: number = 3600
): Promise<T> => {
  const client = getRedisClient();
  
  if (!client) {
    // If Redis is not available, just fetch directly
    return await fetchFn();
  }

  try {
    // Try to get from cache
    const cached = await client.get(key);
    if (cached) {
      return JSON.parse(cached) as T;
    }

    // Not in cache, fetch
    const data = await fetchFn();
    
    // Store in cache
    await client.setex(key, ttlSeconds, JSON.stringify(data));
    
    return data;
  } catch (error) {
    logger.error(`Cache error for key ${key}:`, error);
    // On error, just fetch directly
    return await fetchFn();
  }
};