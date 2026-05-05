import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DateService } from '@src/common/utils/date';
import { MyLogger } from '@src/configs/logger/my-logger';
import { ScheduleService } from '@src/schedule/schedule.service';
import { StudentService } from './student.service';

@Injectable()
export class StudentTask {
  constructor(
    private readonly scheduleService: ScheduleService,
    private readonly studentService: StudentService,
    private readonly date: DateService,
    private readonly logger: MyLogger,
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

      this.logger.log(`Executed schedule changes for ${reservedChanges.length} students`);
    } catch (error) {
      this.logger.error(error);
      setTimeout(() => {
        this.changeSchedule();
      }, 1000 * 60); // 1분 후 재시도
    }
  }
}
