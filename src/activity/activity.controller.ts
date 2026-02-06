import { Body, Controller, Get, Param, ParseIntPipe, Patch, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { toInstance } from '@src/common/utils/toInstance';
import { ActivityService } from './activity.service';
import { ActivityRecordDto } from './dto/activity.response.dto';
import { UpdateActivityRecordRequestDto } from './dto/activity.request.dto';

@ApiTags('activity')
@Controller('activities')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  @ApiOperation({ summary: '일일 활동 기록 조회' })
  @ApiOkResponse({ type: [ActivityRecordDto] })
  async getActivityRecords(@Query('scheduleId', ParseIntPipe) scheduleId: number, @Query('date') date: string) {
    const activityRecords = await this.activityService.getDailyActivityRecords({ scheduleId, date });
    return toInstance(ActivityRecordDto, activityRecords);
  }

  @Patch(':activityRecordId')
  @ApiOperation({ summary: '일일 활동 기록 업데이트' })
  @ApiOkResponse({ type: ActivityRecordDto })
  async updateActivityRecord(@Param('activityRecordId', ParseIntPipe) activityRecordId: number, @Body() updateActivityRecordRequestDto: UpdateActivityRecordRequestDto) {
    // TODO: adminId
    const activityRecord = await this.activityService.updateActivityRecord({ activityRecordId, activityRecordDto: updateActivityRecordRequestDto, adminId: 1 });
    return toInstance(ActivityRecordDto, activityRecord);
  }
}
