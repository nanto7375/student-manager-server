import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as dayjs from 'dayjs';

import { ActivityRecord } from './entity/activity-record.entity';
import { ActivityRecordGenerationLog } from './entity/activity-record-generation-log.entity';
import { Student } from '@src/student/entity/student.entity';

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

  async generateAGLs({ yearMonth }: { yearMonth: string }) {
    const activityGenerationLog = new ActivityRecordGenerationLog();
    activityGenerationLog.generatedActivityYearMonth = yearMonth;
    return await this.arglRepository.save(activityGenerationLog);
  }

  async getAGLsInThisAndNextMonth({ thisMonth, nextMonth }: { thisMonth: string; nextMonth: string }) {
    const activityGenerationLogs = await this.arglRepository.find({ where: { generatedActivityYearMonth: In([thisMonth, nextMonth]) } });
    return activityGenerationLogs;
  }
}
