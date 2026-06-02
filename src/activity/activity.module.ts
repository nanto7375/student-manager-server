import { Module } from '@nestjs/common';

import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';
import { ActivityTask } from './activity.task';

import { ScheduleModule } from '@src/schedule/schedule.module';

@Module({
  imports: [ScheduleModule],
  controllers: [ActivityController],
  providers: [ActivityService, ActivityTask],
  exports: [ActivityService, ActivityTask],
})
export class ActivityModule {}
