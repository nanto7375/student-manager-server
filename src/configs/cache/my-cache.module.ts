import { Global, Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createKeyv } from '@keyv/redis';
import { MyCacheService } from './my-cache.service';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          stores: [
            createKeyv({
              socket: {
                host: configService.get('SM_REDIS_HOST'),
                port: configService.get('SM_REDIS_PORT'),
              },
            }),
          ],
        };
      },
    }),
  ],
  providers: [MyCacheService],
  exports: [MyCacheService],
})
export class MyCacheModule {}
