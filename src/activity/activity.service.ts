import { BadRequestException, Injectable } from '@nestjs/common';

import { ActivityRecord, Student, BookRental } from '@src/generated/prisma/client';
import { ActivityRecordGenerationLogRepository, ActivityRepository } from './activity.repository';

import { DateService } from '@src/common/utils/date';

import { UpdateActivityRecordRequestDto } from './dto/activity.request.dto';

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

  async getDailyActivityRecords({ scheduleId, date }: { scheduleId: number; date: string }) {
    const activityRecords: ActivityRecordWithBorrowedBook[] = await this.activityRepository.findMany({
      where: { date, student: { scheduleId } },
      include: {
        student: {
          include: {
            bookRentals: {
              where: { returnedAt: null },
              take: 1,
              orderBy: { borrowedAt: 'desc' },
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

  async generateThisMonthActivityRecords({ students, dayOfWeek, yearMonth }: { students: Student[]; dayOfWeek: number; yearMonth: string }) {
    const dates = this.date.getDatesInMonthCorrespondingToDayOfWeek({ yearMonth, dayOfWeek });
    const activityRecords = students.flatMap((student) => dates.map((date) => ({ studentId: student.id, date })));
    return await this.activityRepository.createMany(activityRecords);
  }

  async generateARGLs({ yearMonth }: { yearMonth: string }) {
    return await this.activityRecordGenerationLogRepository.create({ generatedActivityYearMonth: yearMonth });
  }

  async getARGLsInThisMonth(yearMonth: string) {
    const activityGenerationLogs = await this.activityRecordGenerationLogRepository.findBy({ generatedActivityYearMonth: yearMonth });
    return activityGenerationLogs;
  }

  async updateActivityRecord({ activityRecordId, activityRecordDto, adminId }: { activityRecordId: number; activityRecordDto: UpdateActivityRecordRequestDto; adminId: number }) {
    const activityRecord = await this.activityRepository.findOrThrow(activityRecordId);
    const { activityKey, activityValue } = activityRecordDto;

    if (!['attendance', 'report1', 'report2'].includes(activityKey)) {
      throw new BadRequestException('invalid activity key');
    }

    const body = { [activityKey]: activityValue };
    await this.activityRepository.update(activityRecord.id, body);
    return true;
  }

  async updateMonthlyActivityRecord({ activityRecordId, activityRecordDto, adminId }: { activityRecordId: number; activityRecordDto: UpdateActivityRecordRequestDto; adminId: number }) {
    const activityRecord = await this.activityRepository.findOrThrow(activityRecordId);
    const { activityKey, activityValue } = activityRecordDto;

    if (!['monthlyPreview', 'monthlyReport'].includes(activityKey)) {
      throw new BadRequestException('invalid activity key');
    }

    const body = { [activityKey]: activityValue };
    const yearMonth = activityRecord.date.substring(0, 7);
    await this.activityRepository.updateMany({
      body,
      where: { studentId: activityRecord.studentId, date: { startsWith: yearMonth } },
    });
    return true;
  }

  async participateMonthlyProject(activityRecordId: number, { adminId }: { adminId: number }) {
    const activityRecord = await this.activityRepository.findOrThrow(activityRecordId);
    if (activityRecord.monthlyProject) return true;

    const yearMonth = activityRecord.date.substring(0, 7);
    await this.activityRepository.updateMany({
      body: { monthlyProject: true },
      where: { studentId: activityRecord.studentId, date: { startsWith: yearMonth } },
    });
    return true;
  }

  async outMonthlyProject(activityRecordId: number, { adminId }: { adminId: number }) {
    const activityRecord = await this.activityRepository.findOrThrow(activityRecordId);
    if (!activityRecord.monthlyProject) return true;

    const yearMonth = activityRecord.date.substring(0, 7);
    await this.activityRepository.updateMany({
      body: { monthlyProject: false, monthlyPreview: false, monthlyReport: false },
      where: { studentId: activityRecord.studentId, date: { startsWith: yearMonth } },
    });
    return true;
  }
}

type ActivityRecordWithBorrowedBook = ActivityRecord & { student: Student & { bookRentals: BookRental[] } };
