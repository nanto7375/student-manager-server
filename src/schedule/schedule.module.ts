import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import { ClassSchedule } from './entity/class-schedule.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ClassSchedule])],
  controllers: [ScheduleController],
  providers: [ScheduleService],
})
export class ScheduleModule {}
