import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { GlobalExceptionFilter, NotFoundExceptionFilter } from './common/exception-filter';
import { RequestMiddleware } from './common/request.middleware';
import { ResponseInterceptor } from './common/response.interceptor';

import { ConfigDynamicModule } from '@src/configs/config.module';
import { MyLoggerModule } from './configs/logger/my-logger.module';
import { MySqlConfigService } from './configs/mysql';

@Module({
  imports: [
    ConfigDynamicModule,
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 10 },
      { name: 'medium', ttl: 10000, limit: 60 },
    ]),
    MyLoggerModule,
    TypeOrmModule.forRootAsync({ useClass: MySqlConfigService }),
  ],
  controllers: [AppController],
  providers: [
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
