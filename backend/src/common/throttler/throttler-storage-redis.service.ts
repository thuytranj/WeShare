import { Injectable } from '@nestjs/common';
import { ThrottlerStorage } from '@nestjs/throttler';
import { ThrottlerStorageRecord } from '@nestjs/throttler/dist/throttler-storage-record.interface';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class ThrottlerStorageRedis implements ThrottlerStorage {
  constructor(private readonly redisService: RedisService) {}

  async increment(key: string, ttl: number): Promise<ThrottlerStorageRecord> {
    const redis = this.redisService.getClient();
    const ttlSeconds = Math.ceil(ttl / 1000);
    const prefixedKey = `throttler:${key}`;

    const results = await redis
      .multi()
      .incr(prefixedKey)
      .ttl(prefixedKey)
      .exec();

    if (!results) {
      throw new Error(`Failed to increment throttle key: ${prefixedKey}`);
    }

    const [incrErr, totalHits] = results[0] as [Error | null, number];
    let [ttlErr, currentTtl] = results[1] as [Error | null, number];

    if (incrErr) throw incrErr;
    if (ttlErr) throw ttlErr;

    if (totalHits === 1 || currentTtl === -1) {
      await redis.expire(prefixedKey, ttlSeconds);
      currentTtl = ttlSeconds;
    }

    return {
      totalHits,
      timeToExpire: Math.max(0, currentTtl * 1000),
    };
  }
}
