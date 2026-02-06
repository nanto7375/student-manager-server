import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { In, Repository } from 'typeorm';
import * as dayjs from 'dayjs';

import { ActivityRecord } from './entity/activity-record.entity';
import { ActivityRecordGenerationLog } from './entity/activity-record-generation-log.entity';
import { ActivityRecordLog } from './entity/activity-record-log.entity';

import { Student } from '@src/student/entity/student.entity';
import { UpdateActivityRecordRequestDto } from './dto/activity.request.dto';
import { isNullish } from '@src/common/utils/etc';
import { ActivityRecordUpdatedEvent } from './activity.event';
import { ACTIVITY_RECORD_UPDATED } from '@src/common/constant/event.const';

/**
 * @description ARGL: ActivityRecordGenerationLog
 */
@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(ActivityRecord)
    private readonly activityRecordRepository: Repository<ActivityRecord>,
    @InjectRepository(ActivityRecordGenerationLog)
    private readonly arglRepository: Repository<ActivityRecordGenerationLog>,
    @InjectRepository(ActivityRecordLog)
    private readonly arlRepository: Repository<ActivityRecordLog>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getDailyActivityRecords({ scheduleId, date }: { scheduleId: number; date: string }) {
    const activityRecords = await this.activityRecordRepository.find({
      where: { date, student: { scheduleId } },
      relations: { student: true },
    });
    return activityRecords;
  }

  getActivityRecordDatesInMonth({ yearMonth, dayOfWeek }: { yearMonth: string; dayOfWeek: number }) {
    const start = dayjs(yearMonth, 'YYYYMM').startOf('month');
    const result: string[] = [];

    let current = start;
    while (current.day() !== dayOfWeek) {
      current = current.add(1, 'day');
    }
    while (current.format('YYYYMM') === yearMonth) {
      result.push(current.format('YYYYMMDD'));
      current = current.add(7, 'day');
    }
    return result;
  }

  async generateActivityRecordsForStudent({ student, dayOfWeek, yearMonth }: { student: Student; dayOfWeek: number; yearMonth: string }) {
    const dates = this.getActivityRecordDatesInMonth({ yearMonth, dayOfWeek });
    const activityRecords: ActivityRecord[] = dates.map((date) => {
      const activityRecord = new ActivityRecord();
      activityRecord.student = student;
      activityRecord.date = date;
      return activityRecord;
    });
    return await this.activityRecordRepository.save(activityRecords);
  }

  async generateActivityRecordsForMonth({ students, dayOfWeek, yearMonth }: { students: Student[]; dayOfWeek: number; yearMonth: string }) {
    const dates = this.getActivityRecordDatesInMonth({ yearMonth, dayOfWeek });
    const activityRecords: ActivityRecord[] = [];

    for (const student of students) {
      for (const date of dates) {
        const activityRecord = new ActivityRecord();
        activityRecord.student = student;
        activityRecord.date = date;
        activityRecords.push(activityRecord);
      }
    }
    await this.activityRecordRepository.save(activityRecords);
  }

  async generateARGLs({ yearMonth }: { yearMonth: string }) {
    const activityGenerationLog = new ActivityRecordGenerationLog();
    activityGenerationLog.generatedActivityYearMonth = yearMonth;
    return await this.arglRepository.save(activityGenerationLog);
  }

  async getARGLsInThisAndNextMonth({ thisMonth, nextMonth }: { thisMonth: string; nextMonth: string }) {
    const activityGenerationLogs = await this.arglRepository.find({ where: { generatedActivityYearMonth: In([thisMonth, nextMonth]) } });
    return activityGenerationLogs;
  }

  async updateActivityRecord({ activityRecordId, activityRecordDto, adminId }: { activityRecordId: number; activityRecordDto: UpdateActivityRecordRequestDto; adminId: number }) {
    const activityRecord = await this.activityRecordRepository.findOne({ where: { id: activityRecordId } });
    if (!activityRecord) throw new NotFoundException('Activity record not found');

    if (!isNullish(activityRecordDto.attended)) {
      activityRecord.attended = activityRecordDto.attended;
      const event = new ActivityRecordUpdatedEvent(adminId, activityRecordId, 'attended', activityRecordDto.attended.toString());
      this.eventEmitter.emit(ACTIVITY_RECORD_UPDATED, event);
    }
    if (!isNullish(activityRecordDto.report1)) {
      activityRecord.report1 = activityRecordDto.report1;
      const event = new ActivityRecordUpdatedEvent(adminId, activityRecordId, 'report1', activityRecordDto.report1.toString());
      this.eventEmitter.emit(ACTIVITY_RECORD_UPDATED, event);
    }
    if (!isNullish(activityRecordDto.report2)) {
      activityRecord.report2 = activityRecordDto.report2;
      const event = new ActivityRecordUpdatedEvent(adminId, activityRecordId, 'report2', activityRecordDto.report2.toString());
      this.eventEmitter.emit(ACTIVITY_RECORD_UPDATED, event);
    }

    return await this.activityRecordRepository.save(activityRecord);
  }

  async generateActivityRecordLog({ activityRecordId, adminId, key, value }: { activityRecordId: number; adminId: number; key: string; value: string }) {
    const activityRecordLog = new ActivityRecordLog();
    activityRecordLog.activityRecordId = activityRecordId;
    activityRecordLog.adminId = adminId;
    activityRecordLog.key = key;
    activityRecordLog.value = value;
    return await this.arlRepository.save(activityRecordLog);
  }
}
