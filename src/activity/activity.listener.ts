import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { APP_BOOTSTRAP_COMPLETED, STUDENT_REGISTERED } from '../common/constant/event.const';
import { ActivityTask } from './activity.task';

@Injectable()
export class ActivityListener {
  constructor(private readonly activityTask: ActivityTask) {}

  @OnEvent(APP_BOOTSTRAP_COMPLETED)
  async generateActivityRecords() {
    await this.activityTask.generateActivityRecords();
  }

  @OnEvent(STUDENT_REGISTERED)
  async generateActivityRecordsForStudent({ studentId }: { studentId: number }) {
    // await this.activityTask.generateActivityRecordsForStudent(student);
  }
}
