import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import { ClassSchedule } from './entity/class-schedule.entity';
import { AuthModule } from '@src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([ClassSchedule]), AuthModule],
  controllers: [ScheduleController],
  providers: [ScheduleService],
  exports: [ScheduleService],
})
export class ScheduleModule {}
