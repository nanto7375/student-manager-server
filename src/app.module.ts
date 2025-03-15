import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { GlobalExceptionFilter, NotFoundExceptionFilter } from './common/exception-filter';
import { RequestMiddleware } from './common/request.middleware';
import { ResponseInterceptor } from './common/response.interceptor';

import { ConfigDynamicModule } from '@src/configs/config.module';
import { MyLoggerModule } from './configs/logger/my-logger.module';
import { MySqlConfigService } from './configs/mysql';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { BannedIpGuard } from './auth/guard/banned-ip.guard';
import { MyCacheModule } from './common/cache/my-cache.module';

@Module({
  imports: [
    ConfigDynamicModule,
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 10 },
      { name: 'medium', ttl: 10000, limit: 60 },
    ]),
    TypeOrmModule.forRootAsync({ useClass: MySqlConfigService }),
    MyLoggerModule,
    MyCacheModule,
    AuthModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: BannedIpGuard },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_FILTER, useClass: NotFoundExceptionFilter },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestMiddleware).forRoutes('*');
  }
}
