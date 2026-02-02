import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ActivityRecord } from './entity/activity-record.entity';
import { In, Repository } from 'typeorm';
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

  async generateActivityRecordsForMonth({ students, month }: { students: Student[]; month: string }) {
    const activityRecords = students.map((student): ActivityRecord => {
      const activityRecord = new ActivityRecord();
      activityRecord.student = student;
      activityRecord.date = month;
      return activityRecord;
    });
    return await this.activityRecordRepository.save(activityRecords);
  }

  async generateAGLs({ month }: { month: string }) {
    const activityGenerationLog = new ActivityGenerationLog();
    activityGenerationLog.generatedActivityMonth = month;
    return await this.activityGenerationLogRepository.save(activityGenerationLog);
  }

  async getAGLsForThisAndNextMonth({ thisMonth, nextMonth }: { thisMonth: string; nextMonth: string }) {
    const activityGenerationLogs = await this.activityGenerationLogRepository.find({ where: { generatedActivityMonth: In([thisMonth, nextMonth]) } });
    return activityGenerationLogs;
  }
}
