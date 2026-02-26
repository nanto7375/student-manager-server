import { Module } from '@nestjs/common';

import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';
import { ActivityTask } from './activity.task';
import { ActivityListener } from './activity.listener';

import { ScheduleModule } from '@src/schedule/schedule.module';
import { ActivityRecordGenerationLogRepository, ActivityRepository } from './activity.repository';

@Module({
  imports: [ScheduleModule],
  controllers: [ActivityController],
  providers: [ActivityService, ActivityTask, ActivityListener, ActivityRepository, ActivityRecordGenerationLogRepository],
})
export class ActivityModule {}
