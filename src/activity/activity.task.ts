import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { MyLogger } from '@src/configs/logger/my-logger';
import { ActivityService } from './activity.service';
import { ScheduleService } from '@src/schedule/schedule.service';
import { DateUtil } from '@src/common/utils/date';

@Injectable()
export class ActivityTask {
  constructor(
    private readonly activityService: ActivityService,
    private readonly scheduleService: ScheduleService,
    private readonly logger: MyLogger,
    private readonly dateUtil: DateUtil,
  ) {
    this.logger.setContext('ActivityTask');
  }

  // TODO: refactoring
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async generateActivityRecordsForAllStudents() {
    try {
      const currentYearMonth = this.dateUtil.currentYearMonth();
      const thisMonthARGL = await this.activityService.getARGLsInThisMonth(currentYearMonth);
      if (thisMonthARGL) return;

      // TODO: transaction
      const schedulesWithStudents = await this.scheduleService.getSchedulesWithStudents();
      for (const schedule of schedulesWithStudents) {
        await this.activityService.generateThisMonthActivityRecords({
          students: schedule.students,
          dayOfWeek: schedule.dayOfWeek,
          yearMonth: currentYearMonth,
        });
      }
      await this.activityService.generateARGLs({ yearMonth: currentYearMonth });
      this.logger.log(`Activity records generated for ${currentYearMonth}`);
    } catch (error) {
      this.logger.error(error);
      setTimeout(
        () => {
          this.generateActivityRecordsForAllStudents();
        },
        1000 * 60 * 5,
      );
    }
  }
}
