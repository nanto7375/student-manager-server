import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';
import { ActivityRecord } from './entity/activity-record.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ActivityRecord])],
  controllers: [ActivityController],
  providers: [ActivityService],
})
export class ActivityModule {}
