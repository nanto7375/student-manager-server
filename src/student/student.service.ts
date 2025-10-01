import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Student } from './entity/student.entity';
import { PatchStudentRequestDto, RegisterStudentRequestDto } from './dto/student-request.dto';
import { StudentBuilder } from './student.builder';
import { ClassSchedule } from '@src/class/entity/class-schedule.entity';
import { NotFound } from '@src/common/exception/definition.exception';

type RegisterStudentParams = {
  studentDto: RegisterStudentRequestDto;
  classSchedule: ClassSchedule;
};
type PatchStudentParams = {
  student: Student;
  studentDto: PatchStudentRequestDto;
  classSchedule?: ClassSchedule;
};

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    private readonly studentBuilder: StudentBuilder,
  ) {}

  async registerStudent({ studentDto, classSchedule }: RegisterStudentParams) {
    const newStudent = this.studentBuilder
      .creator(studentDto.name)
      .setBirth({
        birthYear: studentDto.birthYear,
        birthDate: studentDto.birthDate,
        gender: studentDto.gender,
      })
      .setContacts({
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

    return await this.studentRepository.save(newStudent);
  }

  async patchStudent({ student, studentDto, classSchedule }: PatchStudentParams) {
    const updatedStudent = this.studentBuilder
      .editor(student)
      .setContacts({
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
      })
      .edit();

    return await this.studentRepository.save(updatedStudent);
  }

  async getStudentOrThrow(id: number) {
    const student = await this.studentRepository.findOne({ where: { id } });
    if (!student) throw new NotFound('not found student');
    return student;
  }
}
