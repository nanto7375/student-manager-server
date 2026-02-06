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
      const nextYearMonth = dayjs().add(1, 'month').format('YYYYMM');
      const logs = await this.activityService.getARGLsInThisAndNextMonth({
        thisMonth: currentYearMonth,
        nextMonth: nextYearMonth,
      });

      let [thisMonthCompleted, nextMonthCompleted] = [false, false];
      logs.forEach((log) => {
        if (log.generatedActivityYearMonth === currentYearMonth) thisMonthCompleted = true;
        if (log.generatedActivityYearMonth === nextYearMonth) nextMonthCompleted = true;
      });
      if (thisMonthCompleted && nextMonthCompleted) return;

      const yearMonthsToGenerate = [];
      if (!thisMonthCompleted) yearMonthsToGenerate.push(currentYearMonth);
      if (!nextMonthCompleted) yearMonthsToGenerate.push(nextYearMonth);

      const schedulesWithStudents = await this.scheduleService.getSchedulesWithStudents();
      for (const yearMonth of yearMonthsToGenerate) {
        for (const schedule of schedulesWithStudents) {
          await this.activityService.generateActivityRecordsForMonth({
            students: schedule.students,
            dayOfWeek: schedule.dayOfWeek,
            yearMonth: yearMonth,
          });
        }
        await this.activityService.generateARGLs({ yearMonth: yearMonth });
      }
      this.logger.log(`Activity records generated for ${yearMonthsToGenerate.join(', ')}`);
    } catch (error) {
      this.logger.error(error);
    }
  }
}
