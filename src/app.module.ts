import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule as NestScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { GlobalExceptionFilter, NotFoundExceptionFilter } from './common/exception-filters';
import { RequestMiddleware } from './common/request.middleware';
import { ResponseInterceptor } from './common/response.interceptor';

import { ConfigDynamicModule } from '@src/configs/config.module';
import { MyLoggerModule } from './configs/logger/my-logger.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { MyCacheModule } from './configs/cache/my-cache.module';
import { ScheduleModule } from './schedule/schedule.module';
import { StudentModule } from './student/student.module';

import { AuthGuard } from './auth/guard/auth.guard';
import { RoleGuard } from './admin/admin-role.guard';
import { CustomThrottleGuard } from './common/guards/custom-throttle.guard';
import { ActivityModule } from './activity/activity.module';
import { AppBootstrapService } from './app-bootstrap.service';
import { UtilsModule } from './common/utils/utils.module';
import { PrismaModule } from './configs/prisma/prisma.module';
import { BookRentalModule } from './book-rental/book-rental.module';

@Module({
  imports: [
    ConfigDynamicModule,
    ThrottlerModule.forRoot([]),
    EventEmitterModule.forRoot(),
    NestScheduleModule.forRoot(),
    MyLoggerModule,
    MyCacheModule,
    AuthModule,
    AdminModule,
    ScheduleModule,
    StudentModule,
    ActivityModule,
    UtilsModule,
    PrismaModule,
    BookRentalModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_GUARD, useClass: CustomThrottleGuard },
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RoleGuard },
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
