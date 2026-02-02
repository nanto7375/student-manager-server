import { Controller, Get, Query } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ActivityRecordDto } from './dto/activity.response.dto';
import { toInstance } from '@src/common/utils/toInstance';

@ApiTags('activity')
@Controller('activities')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  @ApiOperation({ summary: '일일 활동 기록 조회' })
  @ApiOkResponse({ type: [ActivityRecordDto] })
  async getActivityRecords(@Query('scheduleId') scheduleId: number, @Query('date') date: string) {
    const activityRecords = await this.activityService.getDailyActivityRecords({ scheduleId, date });
    return toInstance(ActivityRecordDto, activityRecords);
  }
}
