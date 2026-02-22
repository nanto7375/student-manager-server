import { Injectable } from '@nestjs/common';

import { StudentRepository } from './student.repository';
import { StudentBuilder } from './student.builder';
import { type ScheduleResult, ScheduleService } from '@src/schedule/schedule.service';

import { PatchStudentRequestDto, RegisterStudentRequestDto } from './dto/student-request.dto';
import { StudentEvent } from './student.event';
import { SchoolLevel } from '@src/common/constant/common.const';
import { DateService } from '@src/common/utils/date';

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
    private readonly studentBuilder: StudentBuilder,
    private readonly scheduleService: ScheduleService,
    private readonly studentEvent: StudentEvent,
    private readonly studentRepository: StudentRepository,
    private readonly date: DateService,
  ) {}

  async getStudentOrThrow(id: number) {
    return await this.studentRepository.findOrThrow(id);
  }

  async register({ registeredAt = this.date.now(), ...studentDto }: RegisterStudentRequestDto & { registeredAt?: Date }) {
    const schedule = studentDto.scheduleId ? await this.scheduleService.getScheduleOrThrow(studentDto.scheduleId) : null;

    const newStudent = this.studentBuilder
      .creator({
        name: studentDto.name,
        registeredAt,
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
        schoolGrade: studentDto.schoolGrade,
      })
      .setNote(studentDto.note)
      .setSchedule(schedule?.id)
      .create();

    const savedStudent = await this.studentRepository.create(newStudent);
    if (schedule) this.studentEvent.studentScheduleRegistered(savedStudent, schedule);
    return savedStudent;
  }

  async updatePersonalInfo({ studentId, studentDto }: UpdatePersonalInfoParams) {
    const student = await this.studentRepository.findOrThrow(studentId);

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
        schoolGrade: studentDto.schoolGrade,
      })
      .edit();

    return await this.studentRepository.update(studentId, updatedStudent);
  }

  async changeSchedule({ studentId, scheduleId }: ChangeScheduleParams) {
    await this.studentRepository.findOrThrow(studentId);
    const schedule = await this.scheduleService.getScheduleOrThrow(scheduleId);
    const savedStudent = await this.studentRepository.update(studentId, { schedule: { connect: { id: schedule.id } } });
    this.studentEvent.studentScheduleRegistered(savedStudent, schedule);
    return savedStudent;
  }
}

type StudentResult = {
  id: number;
  name: string;
  birthYear: string;
  birthDate: string;
  phone: string;
  parentPhone: string;
  schoolName: string;
  schoolLevel: SchoolLevel;
  schoolGrade: number;
  note: string;
  scheduleId: number;
  registeredAt: Date;
  schedule: ScheduleResult;
};
