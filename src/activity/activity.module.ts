import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';
import { ActivityRecord } from './entity/activity-record.entity';
import { ActivityGenerationLog } from './entity/activity-generation-log.entity';
import { ActivityTask } from './activity.task';
import { ScheduleModule } from '@src/schedule/schedule.module';
import { ActivityListener } from './activity.listener';

@Module({
  imports: [TypeOrmModule.forFeature([ActivityRecord, ActivityGenerationLog]), ScheduleModule],
  controllers: [ActivityController],
  providers: [ActivityService, ActivityTask, ActivityListener],
})
export class ActivityModule {}
