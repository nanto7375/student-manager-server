import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ActivityRecord } from './entity/activity-record.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(ActivityRecord)
    private readonly activityRecordRepository: Repository<ActivityRecord>,
  ) {}

  async getDailyActivityRecords({ scheduleId, date }: { scheduleId: number; date: string }) {
    const activityRecords = await this.activityRecordRepository.find({
      where: { date, student: { scheduleId } },
      relations: { student: true },
    });
    return activityRecords;
  }
}
