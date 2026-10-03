import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { ThrottlerStorageRedis } from '../throttler/throttler-storage-redis.service';

@Global()
@Module({
  providers: [RedisService, ThrottlerStorageRedis],
  exports: [RedisService, ThrottlerStorageRedis],
})
export class RedisModule {}
