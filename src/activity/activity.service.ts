import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as dayjs from 'dayjs';

import { ActivityRecord } from './entity/activity-record.entity';
import { ActivityGenerationLog } from './entity/activity-generation-log.entity';
import { Student } from '@src/student/entity/student.entity';

/**
 * @description AGL: Activity Generation Log
 */
@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(ActivityRecord)
    private readonly activityRecordRepository: Repository<ActivityRecord>,
    @InjectRepository(ActivityGenerationLog)
    private readonly activityGenerationLogRepository: Repository<ActivityGenerationLog>,
  ) {}

  async getDailyActivityRecords({ scheduleId, date }: { scheduleId: number; date: string }) {
    const activityRecords = await this.activityRecordRepository.find({
      where: { date, student: { scheduleId } },
      relations: { student: true },
    });
    return activityRecords;
  }

  async generateActivityRecordsForMonth({ students, dayOfWeek, yearMonth }: { students: Student[]; dayOfWeek: string; yearMonth: string }) {
    const dates = dayjs(yearMonth, 'YYYYMM').daysInMonth();
    const activityRecords = students.map((student): ActivityRecord => {
      const activityRecord = new ActivityRecord();
      activityRecord.student = student;
      // activityRecord.date = month;
      return activityRecord;
    });
    return await this.activityRecordRepository.save(activityRecords);
  }

  async generateAGLs({ yearMonth }: { yearMonth: string }) {
    const activityGenerationLog = new ActivityGenerationLog();
    activityGenerationLog.generatedActivityYearMonth = yearMonth;
    return await this.activityGenerationLogRepository.save(activityGenerationLog);
  }

  async getAGLsInThisAndNextMonth({ thisMonth, nextMonth }: { thisMonth: string; nextMonth: string }) {
    const activityGenerationLogs = await this.activityGenerationLogRepository.find({ where: { generatedActivityYearMonth: In([thisMonth, nextMonth]) } });
    return activityGenerationLogs;
  }
}
