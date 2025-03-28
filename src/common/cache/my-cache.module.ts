import { Global, Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';
import { RedisClientOptions } from 'redis';
import { MyCacheService } from './my-cache.service';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync<RedisClientOptions>({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          store: await redisStore({
            socket: {
              host: configService.get('SM_REDIS_HOST'),
              port: configService.get('SM_REDIS_PORT'),
            },
          }),
        };
      },
    }),
  ],
  providers: [MyCacheService],
  exports: [MyCacheService],
})
export class MyCacheModule {}
