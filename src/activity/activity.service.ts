import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { Student } from '@src/generated/prisma/client';
import { UpdateActivityRecordRequestDto } from './dto/activity.request.dto';
import { isNullish } from '@src/common/utils/etc';
import { ActivityRecordUpdatedEvent } from './activity.event';
import { ACTIVITY_RECORD_UPDATED } from '@src/common/constant/event.const';
import { DateUtil } from '@src/common/utils/date';
import { Prisma } from '@src/generated/prisma/client';
import { ActivityRepository } from './activity.repository';

/**
 * @description ARGL: ActivityRecordGenerationLog
 */
@Injectable()
export class ActivityService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly dateUtil: DateUtil,
    private readonly activityRepository: ActivityRepository,
  ) {}

  async getDailyActivityRecords({ scheduleId, date }: { scheduleId: number; date: string }) {
    const activityRecords = await this.activityRepository.getActivityRecordList({
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
    return await this.activityRepository.createManyActivityRecords(activityRecords);
  }

  async generateARGLs({ yearMonth }: { yearMonth: string }) {
    return await this.activityRepository.createActivityRecordGenerationLog({
      generatedActivityYearMonth: yearMonth,
    });
  }

  async getARGLsInThisMonth(yearMonth: string) {
    const activityGenerationLogs = await this.activityRepository.getActivityRecordGenerationLogBy({ generatedActivityYearMonth: yearMonth });
    return activityGenerationLogs;
  }

  async updateActivityRecord({ activityRecordId, activityRecordDto, adminId }: { activityRecordId: number; activityRecordDto: UpdateActivityRecordRequestDto; adminId: number }) {
    const activityRecord = await this.activityRepository.getActivityRecordOrThrow(activityRecordId);
    if (!activityRecord) throw new NotFoundException('Activity record not found');

    if (!isNullish(activityRecordDto.attended)) {
      activityRecord.attended = activityRecordDto.attended ? 1 : 0;
      const event = new ActivityRecordUpdatedEvent(adminId, activityRecordId, 'attended', activityRecordDto.attended.toString());
      this.eventEmitter.emit(ACTIVITY_RECORD_UPDATED, event);
    }
    if (!isNullish(activityRecordDto.report1)) {
      activityRecord.report1 = activityRecordDto.report1 ? 1 : 0;
      const event = new ActivityRecordUpdatedEvent(adminId, activityRecordId, 'report1', activityRecordDto.report1.toString());
      this.eventEmitter.emit(ACTIVITY_RECORD_UPDATED, event);
    }
    if (!isNullish(activityRecordDto.report2)) {
      activityRecord.report2 = activityRecordDto.report2 ? 1 : 0;
      const event = new ActivityRecordUpdatedEvent(adminId, activityRecordId, 'report2', activityRecordDto.report2.toString());
      this.eventEmitter.emit(ACTIVITY_RECORD_UPDATED, event);
    }

    return await this.activityRepository.updateActivityRecord(activityRecordId, activityRecord);
  }

  async generateActivityRecordLog({ activityRecordId, adminId, key, value }: { activityRecordId: number; adminId: number; key: string; value: string }) {
    return await this.activityRepository.createActivityRecordLog({ activityRecordId, adminId, key, value });
  }
}
