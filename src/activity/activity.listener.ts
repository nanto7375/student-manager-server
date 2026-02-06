import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ACTIVITY_RECORD_UPDATED, APP_BOOTSTRAP_COMPLETED, STUDENT_REGISTERED } from '../common/constant/event.const';
import { ActivityTask } from './activity.task';
import { ActivityRecordUpdatedEvent } from './activity.event';
import { ActivityService } from './activity.service';

@Injectable()
export class ActivityListener {
  constructor(
    private readonly activityTask: ActivityTask,
    private readonly activityService: ActivityService,
  ) {}

  @OnEvent(APP_BOOTSTRAP_COMPLETED)
  async generateActivityRecords() {
    await this.activityTask.generateActivityRecords();
  }

  @OnEvent(STUDENT_REGISTERED)
  async generateActivityRecordsForStudent({ studentId }: { studentId: number }) {
    // await this.activityTask.generateActivityRecordsForStudent(student);
  }

  @OnEvent(ACTIVITY_RECORD_UPDATED)
  async updateActivityRecordLog(event: ActivityRecordUpdatedEvent) {
    await this.activityService.generateActivityRecordLog({ activityRecordId: event.activityRecordId, adminId: event.adminId, key: event.key, value: event.value });
  }
}
