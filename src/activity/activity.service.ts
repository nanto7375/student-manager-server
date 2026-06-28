import { isNullish } from './../common/utils/etc';
import { Injectable, NotFoundException } from '@nestjs/common';

import { ActivityRecord, Student, BookRental, Note, Classroom } from '@src/generated/prisma/client';
import { PrismaService } from '@src/configs/prisma/prisma.service';

import { DateService } from '@src/common/utils/date';

import { UpdateActivityRecordRequestDto } from './dto/activity.request.dto';
import { ScheduleResult } from '@src/schedule/schedule.service';

/**
 * @description ARGL: ActivityRecordGenerationLog
 */
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

  async generateActivityRecord({ studentId, scheduleId, date, isMakeup = false, movedAt }: { studentId: number; scheduleId: number; date: string; isMakeup?: boolean; movedAt?: Date }) {
    return this.prisma.activityRecord.create({
      data: {
        student: { connect: { id: studentId } },
        scheduleId,
        date,
        ...(!isNullish(isMakeup) && { isMakeup }),
        ...(!isNullish(movedAt) && { movedAt }),
      },
    });
  }

  async generateActivityRecordsForSchedule({ studentIds, scheduleId, dayOfWeek, yearMonth = this.date.currentYearMonth(), startDay }: { studentIds: number[]; scheduleId: number; dayOfWeek: number; yearMonth?: string; startDay?: number }) {
    const dates = this.date.getDatesInMonthCorrespondingToDayOfWeek({ yearMonth, dayOfWeek, startDay });
    const activityRecords = studentIds.flatMap((studentId) => dates.map((date) => ({ studentId, date, scheduleId })));
    return await this.prisma.activityRecord.createMany({ data: activityRecords });
  }

  async removeActivityRecordsByScheduleChange({ studentId, schedule, dateForChange }: { studentId: number; schedule: ScheduleResult; dateForChange: string }) {
    const dates = this.date.getDatesInMonthCorrespondingToDayOfWeek({ yearMonth: dateForChange.slice(0, 6), dayOfWeek: schedule.dayOfWeek, startDay: Number(dateForChange.slice(6)) });
    await this.prisma.activityRecord.deleteMany({ where: { studentId, date: { in: dates } } });
  }

  async generateARGLs({ yearMonth }: { yearMonth: string }) {
    return await this.prisma.activityRecordGenerationLog.create({ data: { generatedActivityYearMonth: yearMonth } });
  }

  async getARGLsInThisMonth(yearMonth: string) {
    return await this.prisma.activityRecordGenerationLog.findFirst({ where: { generatedActivityYearMonth: yearMonth } });
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
}

type ActivityRecordWithBorrowedBook = ActivityRecord & { student: Student & { bookRentals: BookRental[]; notes: Note[]; classroom: Classroom } };
