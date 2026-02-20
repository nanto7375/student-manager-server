import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ACTIVITY_RECORD_UPDATED, APP_BOOTSTRAP_COMPLETED, STUDENT_SCHEDULE_REGISTERED } from '../common/constant/event.const';
import { ActivityTask } from './activity.task';
import { ActivityRecordUpdatedEvent } from './activity.event';
import { ActivityService } from './activity.service';
import { StudentScheduleRegisteredEvent } from '@src/student/student.event';
import { MyLogger } from '@src/configs/logger/my-logger';
import { DateService } from '@src/common/utils/date';

@Injectable()
export class ActivityListener {
  constructor(
    private readonly activityTask: ActivityTask,
    private readonly activityService: ActivityService,
    private readonly logger: MyLogger,
    private readonly date: DateService,
  ) {
    this.logger.setContext('ActivityListener');
  }

  @OnEvent(APP_BOOTSTRAP_COMPLETED)
  async generateActivityRecords() {
    try {
      await this.activityTask.generateActivityRecordsForAllStudents();
    } catch (error) {
      this.logger.error(error);
    }
  }

  @OnEvent(STUDENT_SCHEDULE_REGISTERED)
  async generateActivityRecordsForStudent({ student, schedule }: StudentScheduleRegisteredEvent) {
    try {
      const yearMonth = this.date.currentYearMonth();
      await this.activityService.generateThisMonthActivityRecords({ students: [student], dayOfWeek: schedule.dayOfWeek, yearMonth });
    } catch (error) {
      this.logger.error(error);
    }
  }

  @OnEvent(ACTIVITY_RECORD_UPDATED)
  async updateActivityRecordLog({ adminId, activityRecordId, key, value }: ActivityRecordUpdatedEvent) {
    try {
      await this.activityService.generateActivityRecordLog({ activityRecordId, adminId, key, value: value.toString() });
    } catch (error) {
      this.logger.error(error);
    }
  }
}
