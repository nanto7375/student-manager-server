import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { Student } from './entity/student.entity';
import { StudentBuilder } from './student.builder';

@Module({
  imports: [TypeOrmModule.forFeature([Student])],
  controllers: [StudentController],
  providers: [StudentService, StudentBuilder],
})
export class StudentModule {}
