import { Injectable } from '@nestjs/common';

import { Student } from '@src/generated/prisma/client';
import { UpdateActivityRecordRequestDto } from './dto/activity.request.dto';
import { DateUtil } from '@src/common/utils/date';
import { Prisma } from '@src/generated/prisma/client';
import { ActivityRecordGenerationLogRepository, ActivityRecordLogRepository, ActivityRepository } from './activity.repository';
import { isNullish } from '@src/common/utils/etc';
import { ActivityEvent } from './activity.event';

/**
 * @description ARGL: ActivityRecordGenerationLog
 */
@Injectable()
export class ActivityService {
  constructor(
    private readonly dateUtil: DateUtil,
    private readonly activityRepository: ActivityRepository,
    private readonly activityRecordLogRepository: ActivityRecordLogRepository,
    private readonly activityRecordGenerationLogRepository: ActivityRecordGenerationLogRepository,
    private readonly activityEvent: ActivityEvent,
  ) {}

  async getDailyActivityRecords({ scheduleId, date }: { scheduleId: number; date: string }) {
    const activityRecords = await this.activityRepository.findMany({
      where: { date, student: { scheduleId } },
      include: { student: true },
      orderBy: { student: { name: 'asc' } },
    });
    return activityRecords;
  }

  async generateThisMonthActivityRecords({ students, dayOfWeek, yearMonth }: { students: Student[]; dayOfWeek: number; yearMonth: string }) {
    const dates = this.dateUtil.getDatesInMonthCorrespondingToDayOfWeek({ yearMonth, dayOfWeek });
    const activityRecords: Prisma.ActivityRecordCreateManyInput[] = students.flatMap((student) => {
      return dates.map((date) => {
        return { studentId: student.id, date };
      });
    });
    return await this.activityRepository.createMany(activityRecords);
  }

  async generateARGLs({ yearMonth }: { yearMonth: string }) {
    return await this.activityRecordGenerationLogRepository.create({
      generatedActivityYearMonth: yearMonth,
    });
  }

  async getARGLsInThisMonth(yearMonth: string) {
    const activityGenerationLogs = await this.activityRecordGenerationLogRepository.findBy({ generatedActivityYearMonth: yearMonth });
    return activityGenerationLogs;
  }

  async updateActivityRecord({ activityRecordId, activityRecordDto, adminId }: { activityRecordId: number; activityRecordDto: UpdateActivityRecordRequestDto; adminId: number }) {
    const activityRecord = await this.activityRepository.findOrThrow(activityRecordId);

    let updatedEvent: { emit: () => void };
    if (!isNullish(activityRecordDto.attendance)) {
      activityRecord.attendance = activityRecordDto.attendance ? 1 : 0;
      updatedEvent = this.activityEvent.activityRecordUpdated({ adminId, activityRecordId, key: 'attendance', value: activityRecordDto.attendance.toString() });
    }
    if (!isNullish(activityRecordDto.report1)) {
      activityRecord.report1 = activityRecordDto.report1 ? 1 : 0;
      updatedEvent = this.activityEvent.activityRecordUpdated({ adminId, activityRecordId, key: 'report1', value: activityRecordDto.report1.toString() });
    }
    if (!isNullish(activityRecordDto.report2)) {
      activityRecord.report2 = activityRecordDto.report2 ? 1 : 0;
      updatedEvent = this.activityEvent.activityRecordUpdated({ adminId, activityRecordId, key: 'report2', value: activityRecordDto.report2.toString() });
    }

    const result = await this.activityRepository.update(activityRecordId, activityRecord);
    updatedEvent.emit();
    return result;
  }

  async generateActivityRecordLog({ activityRecordId, adminId, key, value }: { activityRecordId: number; adminId: number; key: string; value: string }) {
    return await this.activityRecordLogRepository.create({ activityRecordId, adminId, key, value });
  }
}
