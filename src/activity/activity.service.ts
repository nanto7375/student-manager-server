import { isNullish } from './../common/utils/etc';
import { BadRequestException, Injectable } from '@nestjs/common';

import { ActivityRecord, Student, BookRental, Note } from '@src/generated/prisma/client';
import { ActivityRecordGenerationLogRepository, ActivityRepository } from './activity.repository';

import { DateService } from '@src/common/utils/date';

import { UpdateActivityRecordRequestDto, UpdateMonthlyActivityRecordRequestDto } from './dto/activity.request.dto';
import { ScheduleResult } from '@src/schedule/schedule.service';

/**
 * @description ARGL: ActivityRecordGenerationLog
 */
@Injectable()
export class ActivityService {
  constructor(
    private readonly activityRepository: ActivityRepository,
    private readonly activityRecordGenerationLogRepository: ActivityRecordGenerationLogRepository,
    private readonly date: DateService,
  ) {}

  async getActivityRecords({ scheduleId, date }: { scheduleId: number; date: string }) {
    const activityRecords: ActivityRecordWithBorrowedBook[] = await this.activityRepository.findMany({
      where: { date, scheduleId, student: { deletedAt: null } },
      include: {
        student: {
          include: {
            bookRentals: {
              where: { returnedAt: null },
              take: 1,
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
      borrowedBook: record.student.bookRentals?.[0] ? { ...record.student.bookRentals[0] } : null,
    }));
  }

  async generateActivityRecord({ studentId, scheduleId, date, isMakeup = false, movedAt }: { studentId: number; scheduleId: number; date: string; isMakeup?: boolean; movedAt?: Date }) {
    const body = {
      student: { connect: { id: studentId } },
      scheduleId,
      date,
      ...(!isNullish(isMakeup) && { isMakeup }),
      ...(!isNullish(movedAt) && { movedAt }),
    };
    return this.activityRepository.create(body);
  }

  async generateActivityRecordsForSchedule({ students, dayOfWeek, yearMonth = this.date.currentYearMonth(), startDay }: { students: Student[]; dayOfWeek: number; yearMonth?: string; startDay?: number }) {
    const dates = this.date.getDatesInMonthCorrespondingToDayOfWeek({ yearMonth, dayOfWeek, startDay });
    const activityRecords = students.flatMap((student) => dates.map((date) => ({ studentId: student.id, date, scheduleId: student.scheduleId })));
    return await this.activityRepository.createMany(activityRecords);
  }

  async removeActivityRecordsByScheduleChange({ studentId, schedule, dateForChange }: { studentId: number; schedule: ScheduleResult; dateForChange: string }) {
    const dates = this.date.getDatesInMonthCorrespondingToDayOfWeek({ yearMonth: dateForChange.slice(0, 6), dayOfWeek: schedule.dayOfWeek, startDay: Number(dateForChange.slice(6)) });
    await this.activityRepository.deleteMany({ studentId, date: { in: dates } });
  }

  async generateARGLs({ yearMonth }: { yearMonth: string }) {
    return await this.activityRecordGenerationLogRepository.create({ generatedActivityYearMonth: yearMonth });
  }

  async getARGLsInThisMonth(yearMonth: string) {
    const activityGenerationLogs = await this.activityRecordGenerationLogRepository.findBy({ generatedActivityYearMonth: yearMonth });
    return activityGenerationLogs;
  }

  async updateActivityRecord({ activityRecordId, activityRecordDto }: { activityRecordId: number; activityRecordDto: UpdateActivityRecordRequestDto }) {
    const activityRecord = await this.activityRepository.findOrThrow(activityRecordId);
    const { attendance, report1, report2 } = activityRecordDto;

    const body = {
      ...(attendance !== undefined && { attendance }),
      ...(report1 !== undefined && { report1 }),
      ...(report2 !== undefined && { report2 }),
    };
    await this.activityRepository.update(activityRecord.id, body);
    return true;
  }

  async updateMonthlyActivityRecord({ activityRecordId, activityRecordDto }: { activityRecordId: number; activityRecordDto: UpdateMonthlyActivityRecordRequestDto }) {
    const activityRecord = await this.activityRepository.findOrThrow(activityRecordId);
    const { monthlyProject, monthlyPreview, monthlyReport } = activityRecordDto;

    const notParticipatedIn = !activityRecord.monthlyProject;
    if (notParticipatedIn && (monthlyPreview !== undefined || monthlyReport !== undefined)) {
      throw new BadRequestException('monthly project is not participated');
    }

    const outOfMonthlyProject = monthlyProject === false;
    const body = outOfMonthlyProject
      ? { monthlyProject: false, monthlyPreview: false, monthlyReport: false }
      : {
          ...(monthlyProject !== undefined && { monthlyProject }),
          ...(monthlyPreview !== undefined && { monthlyPreview }),
          ...(monthlyReport !== undefined && { monthlyReport }),
        };
    const yearMonth = activityRecord.date.substring(0, 6);
    await this.activityRepository.updateMany({
      body,
      where: { studentId: activityRecord.studentId, date: { startsWith: yearMonth } },
    });
    return true;
  }
}

type ActivityRecordWithBorrowedBook = ActivityRecord & { student: Student & { bookRentals: BookRental[]; notes: Note[] } };
