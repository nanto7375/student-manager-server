import { BadRequestException, Injectable } from '@nestjs/common';

import { Student } from '@src/generated/prisma/client';
import { UpdateActivityRecordRequestDto } from './dto/activity.request.dto';
import { DateService } from '@src/common/utils/date';
import { ActivityRecordGenerationLogRepository, ActivityRecordLogRepository, ActivityRepository } from './activity.repository';
import { ActivityEvent } from './activity.event';

/**
 * @description ARGL: ActivityRecordGenerationLog
 */
@Injectable()
export class ActivityService {
  constructor(
    private readonly date: DateService,
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
    const { activityKey: key, activityValue: value } = activityRecordDto;

    if (!Object.keys(activityRecord).includes(key)) {
      throw new BadRequestException('invalid activity key');
    }

    const body = { [key]: value };
    const result = await this.activityRepository.update(activityRecordId, body);

    this.activityEvent.activityRecordUpdated({ adminId, activityRecordId, key, value });
    return result;
  }

  async generateActivityRecordLog({ activityRecordId, adminId, key, value }: { activityRecordId: number; adminId: number; key: string; value: string }) {
    return await this.activityRecordLogRepository.create({ activityRecordId, adminId, key, value });
  }

  async participateMonthlyProject({ activityRecordId, adminId }: { activityRecordId: number; adminId: number }) {
    const activityRecord = await this.activityRepository.findOrThrow(activityRecordId);
    if (activityRecord.monthlyProject) throw new BadRequestException('already participated');

    const updatedActivityRecord = await this.activityRepository.updateMany(
      {
        studentId: activityRecord.studentId,
        date: { startsWith: activityRecord.date.substring(0, 7), gte: activityRecord.date },
      },
      { monthlyProject: true },
    );
    this.activityEvent.activityRecordUpdated({ adminId, activityRecordId, key: 'monthlyProject', value: true });
    return updatedActivityRecord;
  }
}
