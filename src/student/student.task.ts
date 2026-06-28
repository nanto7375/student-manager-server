import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DateService } from '@src/common/utils/date';
import { MyLogger } from '@src/configs/logger/my-logger';
import { MailService } from '@src/mail/mail.service';
import { ScheduleService } from '@src/schedule/schedule.service';
import { StudentService } from './student.service';

@Injectable()
export class StudentTask {
  private changeScheduleRetryCount = 0;
  private static readonly MAX_RETRIES = 5;

  constructor(
    private readonly scheduleService: ScheduleService,
    private readonly studentService: StudentService,
    private readonly date: DateService,
    private readonly logger: MyLogger,
    private readonly mailService: MailService,
  ) {}

  @Cron('1 0 * * *') // 매일 00:01에 실행
  async changeSchedule() {
    try {
      const date = this.date.format(this.date.now(), 'YYYYMMDD');
      const reservedChanges = await this.scheduleService.getReservedScheduleChanges(date);
      if (!reservedChanges.length) return;

      const results = await Promise.all(
        reservedChanges.map(async ({ studentId, scheduleId, date }) => {
          const result = await this.studentService.executeScheduleChange({ studentId, scheduleId, dateForChange: date });
          return { studentId, scheduleId, date, success: result };
        }),
      );

      // TODO: results 확인 후 실패 별도 처리

      this.changeScheduleRetryCount = 0;
      this.logger.log(`Executed schedule changes for ${reservedChanges.length} students`);
    } catch (error) {
      this.logger.error(error);
      if (this.changeScheduleRetryCount < StudentTask.MAX_RETRIES) {
        this.changeScheduleRetryCount++;
        setTimeout(() => {
          this.changeSchedule();
        }, 1000 * 60);
      } else {
        this.logger.error(`Schedule change failed after ${StudentTask.MAX_RETRIES} retries`);
        this.mailService.sendErrorAlert({
          subject: 'StudentTask: 스케줄 변경 실패',
          body: `스케줄 자동 변경이 ${StudentTask.MAX_RETRIES}회 재시도 후 실패했습니다.\n\nError: ${error?.message ?? error}\nStack: ${error?.stack ?? 'N/A'}`,
        });
        this.changeScheduleRetryCount = 0;
      }
    }
  }
}
