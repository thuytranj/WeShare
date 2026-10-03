import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { RedisModule } from './common/redis/redis.module';
import { ThrottlerStorageRedis } from './common/throttler/throttler-storage-redis.service';
import { QueueModule } from './queue/queue.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    RedisModule,
    QueueModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: parseInt(configService.get<string>('DB_PORT', '5432'), 10),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_NAME', 'weshare_db'),
        ssl:
          configService.get<string>('DB_SSL') === 'true'
            ? { rejectUnauthorized: false }
            : false,
        namingStrategy: new SnakeNamingStrategy(),
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule, RedisModule],
      inject: [ConfigService, ThrottlerStorageRedis],
      useFactory: (
        configService: ConfigService,
        storage: ThrottlerStorageRedis,
      ) => ({
        throttlers: [
          {
            name: 'default',
            ttl: 60000,
            limit: 60,
          },
          {
            name: 'auth',
            ttl: 60000,
            limit: 5,
          },
        ],
        storage,
      }),
    }),
    UsersModule,
    AuthModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
