import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import { Schedule } from './entity/schedule.entity';
import { AuthModule } from '@src/auth/auth.module';
import { Lesson } from './entity/lesson.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Schedule, Lesson]), AuthModule],
  controllers: [ScheduleController],
  providers: [ScheduleService],
  exports: [ScheduleService],
})
export class ScheduleModule {}
