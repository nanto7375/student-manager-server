import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';
import { ActivityRecord } from './entity/activity-record.entity';
import { ActivityRecordGenerationLog } from './entity/activity-record-generation-log.entity';
import { ActivityTask } from './activity.task';
import { ActivityListener } from './activity.listener';
import { ActivityRecordLog } from './entity/activity-record-log.entity';

import { ScheduleModule } from '@src/schedule/schedule.module';

@Module({
  imports: [TypeOrmModule.forFeature([ActivityRecord, ActivityRecordGenerationLog, ActivityRecordLog]), ScheduleModule],
  controllers: [ActivityController],
  providers: [ActivityService, ActivityTask, ActivityListener],
})
export class ActivityModule {}
