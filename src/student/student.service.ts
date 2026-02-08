import { Injectable } from '@nestjs/common';

import { StudentBuilder } from './student.builder';
import { type ScheduleResult, ScheduleService } from '@src/schedule/schedule.service';

import { PatchStudentRequestDto, RegisterStudentRequestDto } from './dto/student-request.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { STUDENT_SCHEDULE_REGISTERED } from '@src/common/constant/event.const';
import { StudentScheduleRegisteredEvent } from './student.event';
import { SchoolLevel } from '@src/common/constant/common.const';
import { StudentRepository } from './student.repository';

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
    private readonly eventEmitter: EventEmitter2,
    private readonly studentRepository: StudentRepository,
  ) {}

  async register({ ...studentDto }: RegisterStudentRequestDto & { registeredAt: Date }) {
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
        schoolGrade: studentDto.schoolGrade,
      })
      .setNote(studentDto.note)
      .setSchedule(schedule?.id)
      .create();

    const savedStudent = await this.studentRepository.create(newStudent);
    if (schedule) {
      this.eventEmitter.emit(STUDENT_SCHEDULE_REGISTERED, new StudentScheduleRegisteredEvent(savedStudent, schedule));
    }
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
    const student = await this.studentRepository.findOrThrow(studentId);
    const schedule = await this.scheduleService.getScheduleOrThrow(scheduleId);
    student.scheduleId = schedule.id;
    const savedStudent = await this.studentRepository.update(studentId, student);
    this.eventEmitter.emit(STUDENT_SCHEDULE_REGISTERED, new StudentScheduleRegisteredEvent(savedStudent, schedule));
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
