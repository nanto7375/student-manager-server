import { BadRequestException, Injectable } from '@nestjs/common';

import { AssessmentRepository, StudentRepository } from './student.repository';
import { StudentBuilder } from './student.builder';
import { type ScheduleResult, ScheduleService } from '@src/schedule/schedule.service';

import { PatchStudentRequestDto, RegisterStudentRequestDto } from './dto/student-request.dto';
import { StudentEvent } from './student.event';
import { SchoolLevel } from '@src/common/constant/common.const';
import { DateService } from '@src/common/utils/date';
import { PaginationDto } from '@src/common/common.dto';

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

  async getStudents(whereQuery: { name: string; schoolLevel: number; dayOfWeek: number }, { limit, offset }: PaginationDto) {
    const { name, schoolLevel, dayOfWeek } = whereQuery;

    const where = {
      ...(name && { name: { contains: name } }),
      ...(!Number.isNaN(schoolLevel) && { schoolLevel }),
      ...(!Number.isNaN(dayOfWeek) && { schedule: { dayOfWeek } }),
    };
    return await this.studentRepository._.findMany({ where, take: limit, skip: offset, orderBy: { name: 'asc' } });
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

    const savedStudent = await this.studentRepository._.create({ data: newStudent });
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

    return await this.studentRepository._.update({ where: { id: studentId }, data: updatedStudent });
  }

  async changeSchedule({ studentId, scheduleId }: ChangeScheduleParams) {
    const student = await this.studentRepository.findOrThrow(studentId);
    const schedule = await this.scheduleService.getScheduleOrThrow(scheduleId);
    if (student.scheduleId === scheduleId) return student;

    // TODO: 변경을 언제부터 적용할지를 클라이언트로부터 받아야 함

    const savedStudent = await this.studentRepository._.update({ where: { id: studentId }, data: { schedule: { connect: { id: schedule.id } } } });
    this.studentEvent.studentScheduleRegistered(savedStudent, schedule);
    if (student.scheduleId) {
      // TODO:
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

    // TODO: 다른 admin에 의해 수정중이면 접근 못함

    const updated = await this.assessmentRepository._.update({
      where: { id: assessment.id },
      data: { value, lastCommenter: { connect: { id: adminId } } },
    });
    return updated;
  }

  async getAssessments(studentId: number) {
    return await this.assessmentRepository._.findMany({ where: { studentId } });
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
