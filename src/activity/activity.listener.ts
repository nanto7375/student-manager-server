import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { APP_EVENT_BOOTSTRAP_COMPLETED } from '../app-bootstrap.service';
import { ActivityTask } from './activity.task';

@Injectable()
export class ActivityListener {
  constructor(private readonly activityTask: ActivityTask) {}

  @OnEvent(APP_EVENT_BOOTSTRAP_COMPLETED)
  async generateActivityRecords() {
    await this.activityTask.generateActivityRecords();
  }
}
