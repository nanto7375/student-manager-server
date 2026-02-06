import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as dayjs from 'dayjs';

import { MyLogger } from '@src/configs/logger/my-logger';
import { ActivityService } from './activity.service';
import { ScheduleService } from '@src/schedule/schedule.service';

@Injectable()
export class ActivityTask {
  constructor(
    private readonly activityService: ActivityService,
    private readonly scheduleService: ScheduleService,
    private readonly logger: MyLogger,
  ) {
    this.logger.setContext('ActivityTask');
  }

  // TODO: refactoring
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async generateActivityRecords() {
    try {
      const currentYearMonth = dayjs().format('YYYYMM');
      const thisMonthARGL = await this.activityService.getARGLsInThisMonth(currentYearMonth);
      if (thisMonthARGL) return;

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
    }
  }
}
