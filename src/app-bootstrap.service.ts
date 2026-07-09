import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { MyLogger } from './configs/logger/my-logger';
import { ActivityTask } from './activity/activity.task';
import { StudentTask } from './student/student.task';
import { PrismaService } from './configs/prisma/prisma.service';

@Injectable()
export class AppBootstrapService implements OnApplicationBootstrap {
  constructor(
    private readonly activityTask: ActivityTask,
    private readonly studentTask: StudentTask,
    private readonly prisma: PrismaService,
    private readonly logger: MyLogger,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      // DB connection warm-up: connection pool이 준비될 때까지 대기
      await this.waitForDatabase();
      await this.activityTask.generateActivityRecordsForAllStudents();
      await this.studentTask.changeSchedule();
      this.logger.log('Application bootstrap completed');
    } catch (error) {
      this.logger.error(error);
    }
  }

  private async waitForDatabase(retries = 5, delay = 2000): Promise<void> {
    for (let i = 0; i < retries; i++) {
      try {
        await this.prisma.$queryRawUnsafe('SELECT 1');
        return;
      } catch {
        this.logger.log(`Waiting for database connection... (${i + 1}/${retries})`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
}
