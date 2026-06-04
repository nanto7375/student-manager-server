import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Transactional } from '@nestjs-cls/transactional';

import { MyLogger } from '@src/configs/logger/my-logger';
import { ActivityService } from './activity.service';
import { ScheduleService } from '@src/schedule/schedule.service';
import { DateService } from '@src/common/utils/date';

@Injectable()
export class ActivityTask {
  private generateRetryCount = 0;
  private static readonly MAX_RETRIES = 5;

  constructor(
    private readonly activityService: ActivityService,
    private readonly scheduleService: ScheduleService,
    private readonly logger: MyLogger,
    private readonly date: DateService,
  ) {
    this.logger.setContext('ActivityTask');
  }

  // TODO: refactoring
  // TODO: queue로 처리?
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  @Transactional()
  async generateActivityRecordsForAllStudents() {
    try {
      const currentYearMonth = this.date.currentYearMonth();
      const thisMonthARGL = await this.activityService.getARGLsInThisMonth(currentYearMonth);
      if (thisMonthARGL) return;

      const schedulesWithStudents = await this.scheduleService.getSchedulesWithStudents();
      for (const schedule of schedulesWithStudents) {
        await this.activityService.generateActivityRecordsForSchedule({
          studentIds: schedule.students.map((student) => student.id),
          scheduleId: schedule.id,
          dayOfWeek: schedule.dayOfWeek,
          yearMonth: currentYearMonth,
        });
      }
      await this.activityService.generateARGLs({ yearMonth: currentYearMonth });
      this.generateRetryCount = 0;
      this.logger.log(`Activity records generated for ${currentYearMonth}`);
    } catch (error) {
      this.logger.error(error);
      if (this.generateRetryCount < ActivityTask.MAX_RETRIES) {
        this.generateRetryCount++;
        setTimeout(
          () => {
            this.generateActivityRecordsForAllStudents();
          },
          1000 * 60 * 5,
        );
      } else {
        this.logger.error(`Activity record generation failed after ${ActivityTask.MAX_RETRIES} retries`);
        this.generateRetryCount = 0;
      }
    }
  }
}
