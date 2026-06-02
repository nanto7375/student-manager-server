import { Module } from '@nestjs/common';

import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { StudentBuilder } from './student.builder';

import { AuthModule } from '@src/auth/auth.module';
import { ScheduleModule } from '@src/schedule/schedule.module';
import { ActivityModule } from '@src/activity/activity.module';
import { StudentTask } from './student.task';

@Module({
  imports: [AuthModule, ScheduleModule, ActivityModule],
  controllers: [StudentController],
  providers: [StudentService, StudentTask, StudentBuilder],
  exports: [StudentService, StudentTask],
})
export class StudentModule {}
