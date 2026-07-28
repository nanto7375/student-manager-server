import { Injectable, NotFoundException } from '@nestjs/common';

import { ActivityRecord, Student, BookRental, Note, Classroom, Prisma } from '@src/generated/prisma/client';
import { PrismaService } from '@src/configs/prisma/prisma.service';

import { DateService } from '@src/common/utils/date';

import { UpdateActivityRecordRequestDto } from './dto/activity.request.dto';
import { ScheduleResult } from '@src/schedule/schedule.service';
import { DuplicateActivityRecordException } from './activity.exception';
@Injectable()
export class ActivityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly date: DateService,
  ) {}

  async getActivityRecords({ scheduleId, date, studentId }: { scheduleId: number | null; date: string | null; studentId: number | null }) {
    const activityRecords: ActivityRecordWithBorrowedBook[] = await this.prisma.activityRecord.findMany({
      where: {
        ...(date && { date }),
        ...(scheduleId && { scheduleId }),
        ...(studentId && { studentId }),
        student: { deletedAt: null },
      },
      include: {
        student: {
          include: {
            classroom: true,
            bookRentals: {
              where: { returnedAt: null },
              orderBy: { borrowedAt: 'desc' },
            },
            notes: {
              where: { type: { in: ['temporary-memo', 'fixed-memo'] }, deletedAt: null },
            },
          },
        },
      },
      orderBy: { student: { name: 'asc' } },
    });

    return activityRecords.map((record) => ({
      ...record,
      borrowedBooks: record.student.bookRentals ?? [],
    }));
  }

  async createMakeupActivityRecord({ studentId, scheduleId, date, movedAt }: CreateMakeupActivityRecordParams) {
    const existingActivityRecord = await this.prisma.activityRecord.findFirst({
      where: { studentId, scheduleId, date },
      select: { id: true },
    });
    if (existingActivityRecord) throw new DuplicateActivityRecordException();

    try {
      return await this.prisma.activityRecord.create({
        data: {
          student: { connect: { id: studentId } },
          scheduleId,
          date,
          isMakeup: true,
          ...(movedAt && { movedAt }),
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new DuplicateActivityRecordException();
      }
      throw error;
    }
  }

  async ensureScheduledActivityRecords({ studentIds, scheduleId, dayOfWeek, yearMonth = this.date.currentYearMonth(), startDay, monthsToGenerate = 1 }: EnsureScheduledActivityRecordsParams) {
    const dates = this.getScheduleDates({ yearMonth, dayOfWeek, startDay, months: monthsToGenerate });
    const activityRecords = studentIds.flatMap((studentId) => dates.map((date) => ({ studentId, date, scheduleId })));
    return this.prisma.activityRecord.createMany({ data: activityRecords, skipDuplicates: true });
  }

  async removeActivityRecordsByScheduleChange({ studentId, schedule, dateForChange }: { studentId: number; schedule: ScheduleResult; dateForChange: string }) {
    const yearMonth = dateForChange.slice(0, 6);
    const dates = this.getScheduleDates({
      yearMonth,
      dayOfWeek: schedule.dayOfWeek,
      startDay: Number(dateForChange.slice(6)),
      months: 2,
    });
    await this.prisma.activityRecord.deleteMany({
      where: {
        studentId,
        scheduleId: schedule.id,
        isMakeup: false,
        date: { in: dates },
      },
    });
  }

  async createActivityRecordGenerationLog(yearMonth: string) {
    return this.prisma.activityRecordGenerationLog.create({ data: { generatedActivityYearMonth: yearMonth } });
  }

  async findActivityRecordGenerationLog(yearMonth: string) {
    return this.prisma.activityRecordGenerationLog.findFirst({ where: { generatedActivityYearMonth: yearMonth } });
  }

  async updateActivityRecord({ activityRecordId, activityRecordDto }: { activityRecordId: number; activityRecordDto: UpdateActivityRecordRequestDto }) {
    const activityRecord = await this.findActivityRecordOrThrow(activityRecordId);
    const { monthlyProject, ...weeklyFields } = activityRecordDto;

    // monthlyProject는 해당 월 전체에 일괄 적용
    if (monthlyProject !== undefined) {
      const yearMonth = activityRecord.date.substring(0, 6);
      await this.prisma.activityRecord.updateMany({
        where: { studentId: activityRecord.studentId, date: { startsWith: yearMonth } },
        data: { monthlyProject },
      });
    }

    // 주간 필드(attendance, report1, report2)는 해당 레코드만 업데이트
    if (Object.values(weeklyFields).some((v) => v !== undefined)) {
      await this.prisma.activityRecord.update({ where: { id: activityRecord.id }, data: weeklyFields });
    }

    return true;
  }

  private async findActivityRecordOrThrow(id: number) {
    const activityRecord = await this.prisma.activityRecord.findUnique({ where: { id } });
    if (!activityRecord) throw new NotFoundException('not found activity record');
    return activityRecord;
  }

  private getScheduleDates({ yearMonth, dayOfWeek, startDay, months }: ScheduleDateRangeParams) {
    return Array.from({ length: months }, (_, monthOffset) => {
      const targetYearMonth = this.date.addMonthsToYearMonth(yearMonth, monthOffset);
      return this.date.getDatesInMonthCorrespondingToDayOfWeek({
        yearMonth: targetYearMonth,
        dayOfWeek,
        startDay: monthOffset === 0 ? startDay : undefined,
      });
    }).flat();
  }
}

type ActivityRecordWithBorrowedBook = ActivityRecord & { student: Student & { bookRentals: BookRental[]; notes: Note[]; classroom: Classroom } };
type ActivityRecordIdentity = {
  studentId: number;
  scheduleId: number;
  date: string;
};
type CreateMakeupActivityRecordParams = ActivityRecordIdentity & {
  movedAt?: Date;
};
type EnsureScheduledActivityRecordsParams = {
  studentIds: number[];
  scheduleId: number;
  dayOfWeek: number;
  yearMonth?: string;
  startDay?: number;
  monthsToGenerate?: number;
};
type ScheduleDateRangeParams = {
  yearMonth: string;
  dayOfWeek: number;
  startDay?: number;
  months: number;
};
