import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Student } from './entity/student.entity';
import { PatchStudentRequestDto, RegisterStudentRequestDto } from './dto/student-request.dto';
import { StudentBuilder } from './student.builder';
import { Schedule } from '@src/schedule/entity/schedule.entity';
import { ScheduleService } from '@src/schedule/schedule.service';

type RegisterStudentParams = {
  studentDto: RegisterStudentRequestDto;
};
type UpdatePersonalInfoParams = {
  studentId: number;
  studentDto: PatchStudentRequestDto;
};
type ChangeScheduleParams = {
  studentId: number;
  scheduleId: number;
};

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    private readonly studentBuilder: StudentBuilder,
    private readonly scheduleService: ScheduleService,
  ) {}

  async register(studentDto: RegisterStudentRequestDto) {
    const schedule = studentDto.scheduleId ? await this.scheduleService.getScheduleOrThrow(studentDto.scheduleId) : null;

    const newStudent = this.studentBuilder
      .creator({
        name: studentDto.name,
        registeredAt: studentDto.registeredAt,
      })
      .setBirth({
        birthYear: studentDto.birthYear,
        birthDate: studentDto.birthDate,
      })
      .setContacts({
        phone: studentDto.phone,
        parentPhone: studentDto.parentPhone,
      })
      .setSchool({
        schoolName: studentDto.schoolName,
        schoolLevel: studentDto.schoolLevel,
      })
      .setNote(studentDto.note)
      .setSchedule(schedule)
      .create();

    return await this.studentRepository.save(newStudent);
  }

  async updatePersonalInfo({ studentId, studentDto }: UpdatePersonalInfoParams) {
    const student = await this.getStudentOrThrow(studentId);
    const updatedStudent = this.studentBuilder
      .editor(student)
      .setBirth({
        birthYear: studentDto.birthYear,
        birthDate: studentDto.birthDate,
      })
      .setContacts({
        phone: studentDto.phone,
        parentPhone: studentDto.parentPhone,
      })
      .setSchool({
        schoolName: studentDto.schoolName,
        schoolLevel: studentDto.schoolLevel,
      })
      .setNote(studentDto.note)
      .edit();

    return await this.studentRepository.save(updatedStudent);
  }

  async changeSchedule({ studentId, scheduleId }: ChangeScheduleParams) {
    const student = await this.getStudentOrThrow(studentId);
    const schedule = await this.scheduleService.getScheduleOrThrow(scheduleId);
    student.schedule = schedule;
    return await this.studentRepository.save(student);
  }

  async getStudentOrThrow(id: number) {
    const student = await this.studentRepository.findOne({ where: { id } });
    if (!student) throw new NotFoundException('not found student');
    return student;
  }
}
