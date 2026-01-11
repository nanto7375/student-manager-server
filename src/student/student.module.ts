import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { Student } from './entity/student.entity';
import { StudentBuilder } from './student.builder';

import { AuthModule } from '@src/auth/auth.module';
import { ClassModule } from '@src/class/class.module';

@Module({
  imports: [TypeOrmModule.forFeature([Student]), AuthModule, ClassModule],
  controllers: [StudentController],
  providers: [StudentService, StudentBuilder],
})
export class StudentModule {}
