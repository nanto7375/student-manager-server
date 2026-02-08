import { Module } from '@nestjs/common';

import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { StudentBuilder } from './student.builder';

import { AuthModule } from '@src/auth/auth.module';
import { ScheduleModule } from '@src/schedule/schedule.module';
import { StudentRepository } from './student.repository';

@Module({
  imports: [AuthModule, ScheduleModule],
  controllers: [StudentController],
  providers: [StudentService, StudentBuilder, StudentRepository],
})
export class StudentModule {}
