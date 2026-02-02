import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MyLogger } from '@src/configs/logger/my-logger';
import { ActivityService } from './activity.service';
import { ScheduleService } from '@src/schedule/schedule.service';
import * as dayjs from 'dayjs';

@Injectable()
export class ActivityTask {
  constructor(
    private readonly activityService: ActivityService,
    private readonly scheduleService: ScheduleService,
    private readonly logger: MyLogger,
  ) {
    this.logger.setContext('ActivityTask');
  }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async generateActivityRecords() {
    const currentMonth = dayjs().format('YYYYMM');
    const nextMonth = dayjs().add(1, 'month').format('YYYYMM');
    const logs = await this.activityService.getAGLsForThisAndNextMonth({
      thisMonth: currentMonth,
      nextMonth: nextMonth,
    });

    let [thisMonthCompleted, nextMonthCompleted] = [false, false];
    logs.forEach((log) => {
      if (log.generatedActivityMonth === currentMonth) thisMonthCompleted = true;
      if (log.generatedActivityMonth === nextMonth) nextMonthCompleted = true;
    });
    if (thisMonthCompleted && nextMonthCompleted) return;

    const monthsToGenerate = [];
    if (!thisMonthCompleted) monthsToGenerate.push(currentMonth);
    if (!nextMonthCompleted) monthsToGenerate.push(nextMonth);

    const schedulesWithStudents = await this.scheduleService.getSchedulesWithStudents();
    for (const month of monthsToGenerate) {
      for (const schedule of schedulesWithStudents) {
        await this.activityService.generateActivityRecordsForMonth({
          students: schedule.students,
          month: month,
        });
      }
      await this.activityService.generateAGLs({ month: month });
    }
  }
}
