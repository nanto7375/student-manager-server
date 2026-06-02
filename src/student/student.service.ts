import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { StudentBuilder } from './student.builder';
import { type ScheduleResult, ScheduleService } from '@src/schedule/schedule.service';

import { PatchStudentRequestDto, RegisterStudentRequestDto } from './dto/student-request.dto';
import { SchoolLevel, Status } from '@src/common/constant/common.const';
import { DateService } from '@src/common/utils/date';
import { PaginationDto } from '@src/common/common.dto';
import { ActivityService } from '@src/activity/activity.service';
import { Transactional } from '@nestjs-cls/transactional';
import { Prisma } from '@src/generated/prisma/client';
import { PrismaService } from '@src/configs/prisma/prisma.service';

type NoteType = 'assessment' | 'parent-counseling' | 'fixed-memo' | 'temporary-memo';

@Injectable()
export class StudentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly studentBuilder: StudentBuilder,
    private readonly scheduleService: ScheduleService,
    private readonly activityService: ActivityService,
    private readonly date: DateService,
  ) {}

  async getStudentOrThrow(id: number, { includeNotes = false, includeScheduleChangeReservations = false } = {}) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: {
        schedule: { include: { lesson: true } },
        classroom: true,
        notes: includeNotes ? { where: { deletedAt: null }, include: { lastCommenter: true } } : false,
        scheduleChangeReservations: includeScheduleChangeReservations ? { where: { completedAt: null }, include: { schedule: true } } : false,
      },
    });
    if (!student) throw new NotFoundException('not found student');
    return student;
  }

  async getStudents(whereQuery: { name: string; schoolLevel: number; dayOfWeek: number; status?: string }, { limit, offset, sort }: PaginationDto) {
    const { name, schoolLevel, dayOfWeek, status } = whereQuery;
    const [sortKey, sortOrder] = sort.split('-');
    const where = {
      ...(name && { name: { contains: name } }),
      ...(!Number.isNaN(schoolLevel) && { schoolLevel }),
      ...(!Number.isNaN(dayOfWeek) && { schedule: { dayOfWeek } }),
      ...(status && status === Status.ACTIVE && { deletedAt: null }),
    };

    const students = await this.prisma.student.findMany({
      where,
      include: {
        schedule: { include: { lesson: true } },
        classroom: true,
        scheduleChangeReservations: { where: { completedAt: null }, include: { schedule: true } },
      },
      take: limit,
      skip: offset,
      orderBy: { [sortKey]: sortOrder as Prisma.SortOrder },
    });
    const count = await this.prisma.student.count({ where });
    return [students, count];
  }

  @Transactional()
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
      .setSchedule(schedule?.id, studentDto.classroomId)
      .create();

    const savedStudent = await this.prisma.student.create({ data: newStudent });
    if (schedule) {
      await this.activityService.generateActivityRecordsForSchedule({
        studentIds: [savedStudent.id],
        scheduleId: schedule.id,
        dayOfWeek: schedule.dayOfWeek,
      });
    }
    return savedStudent;
  }

  async updatePersonalInfo({ studentId, studentDto }: UpdatePersonalInfoParams) {
    const student = await this.getStudentOrThrow(studentId);

    const updatedData = this.studentBuilder
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

    return await this.prisma.student.update({ where: { id: studentId }, data: updatedData });
  }

  async changeSchedule({ studentId, scheduleId, dateForChange }: ChangeScheduleParams) {
    const student = await this.getStudentOrThrow(studentId);
    const schedule = await this.scheduleService.getScheduleOrThrow(scheduleId);
    if (student.scheduleId === scheduleId) return true;

    if (!student.scheduleId) {
      const savedStudent = await this.prisma.student.update({
        where: { id: studentId },
        data: { schedule: { connect: { id: schedule.id } } },
      });
      await this.activityService.generateActivityRecordsForSchedule({
        studentIds: [savedStudent.id],
        scheduleId: schedule.id,
        dayOfWeek: schedule.dayOfWeek,
      });
    } else {
      const now = this.date.format(this.date.now(), 'YYYYMMDD');
      if (dateForChange === now) {
        await this.executeScheduleChange({ studentId, scheduleId, dateForChange });
      } else {
        await this.scheduleService.reserveScheduleChange({ studentId, scheduleId, date: dateForChange });
      }
    }
    return true;
  }

  @Transactional()
  async executeScheduleChange({ studentId, scheduleId, dateForChange }: ChangeScheduleParams) {
    let student, schedule;
    try {
      student = await this.getStudentOrThrow(studentId);
      schedule = await this.scheduleService.getScheduleOrThrow(scheduleId);
    } catch (error) {
      if (error instanceof NotFoundException) return false;
      else throw error;
    }

    const previousSchedule = student.schedule;
    const [yearMonth, day] = [dateForChange.slice(0, 6), dateForChange.slice(6)];

    await this.activityService.removeActivityRecordsByScheduleChange({ studentId, schedule: previousSchedule, dateForChange });
    await this.activityService.generateActivityRecordsForSchedule({
      studentIds: [student.id],
      dayOfWeek: schedule.dayOfWeek,
      scheduleId,
      yearMonth,
      startDay: Number(day),
    });
    await this.prisma.student.update({
      where: { id: studentId },
      data: { schedule: { connect: { id: scheduleId } } },
    });

    await this.scheduleService.completeReservedScheduleChange({ studentId, date: dateForChange, scheduleId });
    await this.scheduleService.deleteReservedScheduleChanges(studentId);
    return true;
  }

  async registerMakeupSchedule({ studentId, scheduleId, dateForMakeup, movedAt }: { studentId: number; scheduleId: number; dateForMakeup: string; movedAt?: Date }) {
    await this.getStudentOrThrow(studentId);
    await this.scheduleService.getScheduleOrThrow(scheduleId);
    await this.activityService.generateActivityRecord({ studentId, scheduleId, date: dateForMakeup, isMakeup: true, movedAt });
    return true;
  }

  async createNote({ studentId, value, type, adminId }: { studentId: number; value: string; type: NoteType; adminId: number }) {
    if (value.length > 5000) throw new BadRequestException();

    return await this.prisma.note.create({
      data: {
        value,
        type,
        student: { connect: { id: studentId } },
        lastCommenter: { connect: { id: adminId } },
      },
    });
  }

  async updateNote({ noteId, adminId, studentId, value }: UpdateNoteParams) {
    const note = await this.findNoteOrThrow(noteId);
    if (note.studentId !== studentId) throw new BadRequestException();

    return await this.prisma.note.update({
      where: { id: noteId },
      data: { value, lastCommenter: { connect: { id: adminId } } },
    });
  }

  async getNotes(studentId: number) {
    return await this.prisma.note.findMany({
      where: { studentId, deletedAt: null },
      include: { lastCommenter: true },
      orderBy: { id: 'asc' },
    });
  }

  @Transactional()
  async deleteStudent(studentId: number) {
    await this.getStudentOrThrow(studentId);
    await this.prisma.student.update({ where: { id: studentId }, data: { deletedAt: this.date.now() } });
    await this.scheduleService.deleteReservedScheduleChanges(studentId);
    return true;
  }

  async toggleNoteStatus(noteId: number) {
    const note = await this.findNoteOrThrow(noteId, { paranoid: false });
    const newStatus = note.deletedAt ? null : this.date.now();
    return await this.prisma.note.update({ where: { id: noteId }, data: { deletedAt: newStatus } });
  }

  async changeClassroom({ studentId, classroomId }: { studentId: number; classroomId: number }) {
    const classroomIds = [1, 2, 3, 4];
    if (!classroomIds.includes(classroomId)) throw new BadRequestException();
    await this.getStudentOrThrow(studentId);
    await this.prisma.student.update({ where: { id: studentId }, data: { classroom: { connect: { id: classroomId } } } });
    return true;
  }

  private async findNoteOrThrow(id: number, { paranoid = true } = {}) {
    const note = await this.prisma.note.findUnique({ where: { id } });
    if (!note) throw new NotFoundException();
    if (paranoid && note.deletedAt) throw new BadRequestException();
    return note;
  }
}

type UpdatePersonalInfoParams = {
  studentId: number;
  studentDto: PatchStudentRequestDto;
};
type ChangeScheduleParams = {
  studentId: number;
  scheduleId: number;
  dateForChange: string; // YYYYMMDD
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
