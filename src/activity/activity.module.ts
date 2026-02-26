import { Module } from '@nestjs/common';

import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';
import { ActivityTask } from './activity.task';
import { ActivityListener } from './activity.listener';

import { ScheduleModule } from '@src/schedule/schedule.module';
import { ActivityRecordGenerationLogRepository, ActivityRepository, BookRentalRepository } from './activity.repository';
import { StudentModule } from '@src/student/student.module';

@Module({
  imports: [ScheduleModule, StudentModule],
  controllers: [ActivityController],
  providers: [ActivityService, ActivityTask, ActivityListener, ActivityRepository, ActivityRecordGenerationLogRepository, BookRentalRepository],
})
export class ActivityModule {}
