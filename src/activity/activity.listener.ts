import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { APP_BOOTSTRAP_COMPLETED } from '../common/constant/event.const';
import { ActivityTask } from './activity.task';
import { MyLogger } from '@src/configs/logger/my-logger';

@Injectable()
export class ActivityListener {
  constructor(
    private readonly activityTask: ActivityTask,
    private readonly logger: MyLogger,
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
}
