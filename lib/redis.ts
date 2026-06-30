import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const CACHE_TTL = {
  KUNDLI: 60 * 60 * 24 * 7,       // 7 days
  PANCHANG: 60 * 60 * 24,          // 24 hours
  TRANSIT: 60 * 60 * 12,           // 12 hours
  MILAN: 60 * 60 * 24 * 30,        // 30 days
} as const;
