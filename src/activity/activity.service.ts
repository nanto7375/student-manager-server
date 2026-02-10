import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { Student } from '@src/generated/prisma/client';
import { UpdateActivityRecordRequestDto } from './dto/activity.request.dto';
import { ACTIVITY_RECORD_UPDATED } from '@src/common/constant/event.const';
import { DateUtil } from '@src/common/utils/date';
import { Prisma } from '@src/generated/prisma/client';
import { ActivityRecordGenerationLogRepository, ActivityRecordLogRepository, ActivityRepository } from './activity.repository';
import { isNullish } from '@src/common/utils/etc';
import { ActivityRecordUpdatedEvent } from './activity.event';

/**
 * @description ARGL: ActivityRecordGenerationLog
 */
@Injectable()
export class ActivityService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly dateUtil: DateUtil,
    private readonly activityRepository: ActivityRepository,
    private readonly activityRecordLogRepository: ActivityRecordLogRepository,
    private readonly activityRecordGenerationLogRepository: ActivityRecordGenerationLogRepository,
  ) {}

  async getDailyActivityRecords({ scheduleId, date }: { scheduleId: number; date: string }) {
    const activityRecords = await this.activityRepository.findMany({
      where: { date, student: { scheduleId } },
      include: { student: true },
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

    let event: ActivityRecordUpdatedEvent;
    if (!isNullish(activityRecordDto.attended)) {
      activityRecord.attended = activityRecordDto.attended ? 1 : 0;
      event = new ActivityRecordUpdatedEvent(adminId, activityRecordId, 'attended', activityRecordDto.attended.toString());
    }
    if (!isNullish(activityRecordDto.report1)) {
      activityRecord.report1 = activityRecordDto.report1 ? 1 : 0;
      event = new ActivityRecordUpdatedEvent(adminId, activityRecordId, 'report1', activityRecordDto.report1.toString());
    }
    if (!isNullish(activityRecordDto.report2)) {
      activityRecord.report2 = activityRecordDto.report2 ? 1 : 0;
      event = new ActivityRecordUpdatedEvent(adminId, activityRecordId, 'report2', activityRecordDto.report2.toString());
    }

    const result = await this.activityRepository.update(activityRecordId, activityRecord);
    this.eventEmitter.emit(ACTIVITY_RECORD_UPDATED, event);
    return result;
  }

  async generateActivityRecordLog({ activityRecordId, adminId, key, value }: { activityRecordId: number; adminId: number; key: string; value: string }) {
    return await this.activityRecordLogRepository.create({ activityRecordId, adminId, key, value });
  }
}
