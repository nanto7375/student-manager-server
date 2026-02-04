import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule as NestScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { GlobalExceptionFilter, NotFoundExceptionFilter } from './common/exception-filters';
import { RequestMiddleware } from './common/request.middleware';
import { ResponseInterceptor } from './common/response.interceptor';

import { ConfigDynamicModule } from '@src/configs/config.module';
import { MyLoggerModule } from './configs/logger/my-logger.module';
import { MySqlConfigService } from './configs/mysql';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { MyCacheModule } from './configs/cache/my-cache.module';
import { ScheduleModule } from './schedule/schedule.module';
import { StudentModule } from './student/student.module';

import { BannedIpGuard } from './auth/guard/banned-ip.guard';
import { AuthGuard } from './auth/guard/auth.guard';
import { RoleGuard } from './admin/admin-role.guard';
import { ActivityModule } from './activity/activity.module';
import { AppBootstrapService } from './app-bootstrap.service';

@Module({
  imports: [
    ConfigDynamicModule,
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 10 },
      { name: 'medium', ttl: 10000, limit: 60 },
    ]),
    TypeOrmModule.forRootAsync({ useClass: MySqlConfigService }),
    EventEmitterModule.forRoot(),
    NestScheduleModule.forRoot(),
    MyLoggerModule,
    MyCacheModule,
    AuthModule,
    AdminModule,
    ScheduleModule,
    StudentModule,
    ActivityModule,
  ],
  controllers: [AppController],
  providers: [
    // { provide: APP_GUARD, useClass: ThrottlerGuard },
    // { provide: APP_GUARD, useClass: BannedIpGuard },
    // { provide: APP_GUARD, useClass: AuthGuard },
    // { provide: APP_GUARD, useClass: RoleGuard },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_FILTER, useClass: NotFoundExceptionFilter },
    AppBootstrapService,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestMiddleware).forRoutes('*');
  }
}
