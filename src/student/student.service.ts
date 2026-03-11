import { BadRequestException, Injectable } from '@nestjs/common';

import { AssessmentRepository, StudentRepository } from './student.repository';
import { StudentBuilder } from './student.builder';
import { type ScheduleResult, ScheduleService } from '@src/schedule/schedule.service';

import { PatchStudentRequestDto, RegisterStudentRequestDto } from './dto/student-request.dto';
import { StudentEvent } from './student.event';
import { SchoolLevel } from '@src/common/constant/common.const';
import { DateService } from '@src/common/utils/date';

@Injectable()
export class StudentService {
  constructor(
    private readonly studentBuilder: StudentBuilder,
    private readonly scheduleService: ScheduleService,
    private readonly studentEvent: StudentEvent,
    private readonly studentRepository: StudentRepository,
    private readonly assessmentRepository: AssessmentRepository,
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
    const student = await this.studentRepository.findOrThrow(studentId);
    const schedule = await this.scheduleService.getScheduleOrThrow(scheduleId);
    if (student.scheduleId === scheduleId) return student;

    const savedStudent = await this.studentRepository.update(studentId, { schedule: { connect: { id: schedule.id } } });
    if (!student.scheduleId) {
      this.studentEvent.studentScheduleRegistered(savedStudent, schedule);
    } else {
      // TODO
      // const previousSchedule = await this.scheduleService.getScheduleOrThrow(student.scheduleId);
      // this.studentEvent.studentScheduleChanged(savedStudent, previousSchedule, schedule);
    }
    return savedStudent;
  }

  async createAssessmentRecord(adminId: number) {
    return await this.assessmentRepository._.create({ data: { lastCommenter: { connect: { id: adminId } } } });
  }

  async updateAssessment({ assessmentId, adminId, studentId, value }: UpdateAssessmentParams) {
    const assessment = await this.assessmentRepository.findOrThrow(assessmentId);
    if (assessment.studentId !== studentId) throw new BadRequestException(); // 필요한가
    const updated = await this.assessmentRepository._.update({
      where: { id: assessment.id },
      data: { value, lastCommenter: { connect: { id: adminId } } },
    });
    return updated;
  }
}

type UpdatePersonalInfoParams = {
  studentId: number;
  studentDto: PatchStudentRequestDto;
};
type ChangeScheduleParams = {
  studentId: number;
  scheduleId: number;
};
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
type UpdateAssessmentParams = {
  assessmentId: number;
  adminId: number;
  studentId: number;
  value: string;
};
