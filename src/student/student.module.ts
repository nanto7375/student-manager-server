import { Module } from '@nestjs/common';

import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { StudentBuilder } from './student.builder';

import { AuthModule } from '@src/auth/auth.module';
import { ScheduleModule } from '@src/schedule/schedule.module';
import { AssessmentRepository, StudentRepository } from './student.repository';
import { StudentEvent } from './student.event';

@Module({
  imports: [AuthModule, ScheduleModule],
  controllers: [StudentController],
  providers: [StudentService, StudentBuilder, StudentRepository, AssessmentRepository, StudentEvent],
  exports: [StudentService],
})
export class StudentModule {}
