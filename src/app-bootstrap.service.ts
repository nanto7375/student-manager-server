import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { MyLogger } from './configs/logger/my-logger';
import { ActivityTask } from './activity/activity.task';
import { StudentTask } from './student/student.task';

@Injectable()
export class AppBootstrapService implements OnApplicationBootstrap {
  constructor(
    private readonly activityTask: ActivityTask,
    private readonly studentTask: StudentTask,
    private readonly logger: MyLogger,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      await this.activityTask.generateActivityRecordsForAllStudents();
      await this.studentTask.changeSchedule();
      this.logger.log('Application bootstrap completed');
    } catch (error) {
      this.logger.error(error);
    }
  }
}
