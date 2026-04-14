import Redis from 'ioredis';
import { env } from './env';
export const redis = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null, enableReadyCheck: false, retryStrategy: t => (t > 5 ? null : Math.min(t * 200, 3000)) });
redis.on('error', e => console.error('Redis:', e.message));
export default redis;
