import { BadRequestException, Injectable } from '@nestjs/common';

import { NoteRepository, StudentRepository } from './student.repository';
import { StudentBuilder } from './student.builder';
import { type ScheduleResult, ScheduleService } from '@src/schedule/schedule.service';

import { PatchStudentRequestDto, RegisterStudentRequestDto } from './dto/student-request.dto';
import { SchoolLevel } from '@src/common/constant/common.const';
import { DateService } from '@src/common/utils/date';
import { PaginationDto } from '@src/common/common.dto';
import { ActivityService } from '@src/activity/activity.service';

type NoteType = 'assessment' | 'parent-counseling' | 'fixed-memo' | 'temporary-memo';

@Injectable()
export class StudentService {
  constructor(
    private readonly studentBuilder: StudentBuilder,
    private readonly studentRepository: StudentRepository,
    private readonly noteRepository: NoteRepository,
    private readonly scheduleService: ScheduleService,
    private readonly activityService: ActivityService,
    private readonly date: DateService,
  ) {}

  async getStudentOrThrow(id: number, { includeNotes = false } = {}) {
    return await this.studentRepository.findOrThrow(id, { includeNotes });
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

    // TODO: transaction 처리할지 고민
    const savedStudent = await this.studentRepository._.create({ data: newStudent });
    if (schedule) {
      await this.activityService.generateThisMonthActivityRecords({
        students: [savedStudent],
        dayOfWeek: schedule.dayOfWeek,
      });
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

    return await this.studentRepository._.update({ where: { id: studentId }, data: updatedStudent });
  }

  async changeSchedule({ studentId, scheduleId }: ChangeScheduleParams) {
    const student = await this.studentRepository.findOrThrow(studentId);
    const schedule = await this.scheduleService.getScheduleOrThrow(scheduleId);
    if (student.scheduleId === scheduleId) return student;

    // TODO: 변경을 언제부터 적용할지를 클라이언트로부터 받아야 함

    const savedStudent = await this.studentRepository._.update({
      where: { id: studentId },
      data: { schedule: { connect: { id: schedule.id } } },
    });
    // TODO: transaction 처리할지 고민
    await this.activityService.generateThisMonthActivityRecords({
      students: [savedStudent],
      dayOfWeek: schedule.dayOfWeek,
    });
    if (student.scheduleId) {
      // TODO:
      // const previousSchedule = await this.scheduleService.getScheduleOrThrow(student.scheduleId);
      // this.studentEvent.studentScheduleChanged(savedStudent, previousSchedule, schedule);
    }
    return savedStudent;
  }

  async createNote({ studentId, value, type, adminId }: { studentId: number; value: string; type: NoteType; adminId: number }) {
    if (value.length > 5000) throw new BadRequestException();

    return await this.noteRepository._.create({
      data: {
        value,
        type,
        student: { connect: { id: studentId } },
        lastCommenter: { connect: { id: adminId } },
      },
    });
  }

  async updateNote({ noteId, adminId, studentId, value }: UpdateNoteParams) {
    const note = await this.noteRepository.findOrThrow(noteId);
    if (note.studentId !== studentId) throw new BadRequestException(); // 필요한가

    // TODO: 다른 admin에 의해 수정중이면 접근 못함

    const updated = await this.noteRepository._.update({
      where: { id: noteId },
      data: { value, lastCommenter: { connect: { id: adminId } } },
    });
    return updated;
  }

  async getNotes(studentId: number) {
    return await this.noteRepository._.findMany({
      where: { studentId, deletedAt: null },
      include: { lastCommenter: true },
      orderBy: { id: 'asc' },
    });
  }

  async deleteNote(noteId: number) {
    await this.noteRepository.findOrThrow(noteId);
    return await this.noteRepository.softDelete(noteId);
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
type UpdateNoteParams = {
  noteId: number;
  adminId: number;
  studentId: number;
  value: string;
};
