import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';

import { MyLogger } from '@src/configs/logger/my-logger';
import { MailService } from '@src/mail/mail.service';
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
    private readonly mailService: MailService,
    private readonly transactionHost: TransactionHost<TransactionalAdapterPrisma>,
  ) {
    this.logger.setContext('ActivityTask');
  }

  // TODO: queue로 처리?
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async generateActivityRecordsForAllStudents() {
    try {
      const currentYearMonth = this.date.currentYearMonth();
      const targetYearMonths = [currentYearMonth, this.date.addMonthsToYearMonth(currentYearMonth, 1)];

      for (const yearMonth of targetYearMonths) {
        await this.transactionHost.withTransaction(() => this.generateActivityRecordsForMonth(yearMonth));
      }

      this.generateRetryCount = 0;
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
        this.mailService.sendErrorAlert({
          subject: 'ActivityTask: 활동 기록 생성 실패',
          body: `활동 기록 자동 생성이 ${ActivityTask.MAX_RETRIES}회 재시도 후 실패했습니다.\n\nError: ${error?.message ?? error}\nStack: ${error?.stack ?? 'N/A'}`,
        });
        this.generateRetryCount = 0;
      }
    }
  }

  private async generateActivityRecordsForMonth(yearMonth: string): Promise<void> {
    const generationLog = await this.activityService.findActivityRecordGenerationLog(yearMonth);
    if (generationLog) return;

    const schedulesWithStudents = await this.scheduleService.getSchedulesWithStudents();
    for (const schedule of schedulesWithStudents) {
      await this.activityService.ensureScheduledActivityRecords({
        studentIds: schedule.students.map((student) => student.id),
        scheduleId: schedule.id,
        dayOfWeek: schedule.dayOfWeek,
        yearMonth,
      });
    }
    await this.activityService.createActivityRecordGenerationLog(yearMonth);
    this.logger.log(`Activity records generated for ${yearMonth}`);
  }
}
