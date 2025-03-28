import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Student } from './entity/student.entity';
import { RegisterStudentRequestDto } from './dto/student-request.dto';
import { StudentBuilder } from './student.builder';
import { ClassSchedule } from '@src/schedule/entity/class-schedule.entity';

type RegisterStudentParams = {
  studentDto: RegisterStudentRequestDto;
  classSchedule: ClassSchedule;
};

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    private readonly studentBuilder: StudentBuilder,
  ) {}

  async registerStudent({ studentDto, classSchedule }: RegisterStudentParams) {
    const student = this.studentBuilder
      .creator(studentDto.name)
      .setBirth({
        birthYear: studentDto.birthYear,
        birthDate: studentDto.birthDate,
        gender: studentDto.gender,
      })
      .setPhone({
        phone: studentDto.phone,
        parentPhone: studentDto.parentPhone,
      })
      .setSchool({
        schoolName: studentDto.schoolName,
        schoolLevel: studentDto.schoolLevel,
      })
      .setClass({
        classSchedule,
        tuition: studentDto.tuition,
        registeredAt: studentDto.registeredAt,
      })
      .create();

    return await this.studentRepository.save(student);
  }
}
