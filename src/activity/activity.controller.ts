import { Body, Controller, Get, Param, ParseBoolPipe, ParseIntPipe, Patch, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { toInstance } from '@src/common/utils/toInstance';
import { UpdateActivityRecordRequestDto } from './dto/activity.request.dto';
import { ActivityRecordDto } from './dto/activity.response.dto';

import { ActivityService } from './activity.service';

@ApiTags('activity')
@Controller('activities')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  @ApiOperation({ summary: '활동 기록 조회' })
  @ApiOkResponse({ type: [ActivityRecordDto] })
  async getActivityRecords(@Query('scheduleId', ParseIntPipe) scheduleId: number, @Query('date') date: string) {
    const activityRecords = await this.activityService.getActivityRecords({ scheduleId, date });
    return toInstance(ActivityRecordDto, activityRecords);
  }

  @Patch(':activityRecordId')
  @ApiOperation({ summary: '활동 기록 업데이트' })
  @ApiOkResponse({ type: Boolean })
  async updateActivityRecord(
    @Param('activityRecordId', ParseIntPipe) activityRecordId: number, //
    @Query('monthly', ParseBoolPipe) monthly: boolean,
    @Body() updateActivityRecordRequestDto: UpdateActivityRecordRequestDto,
  ) {
    // TODO: adminId
    const params = {
      activityRecordId,
      activityRecordDto: updateActivityRecordRequestDto,
      adminId: 1,
    };
    const result = !monthly //
      ? await this.activityService.updateActivityRecord(params)
      : await this.activityService.updateMonthlyActivityRecord(params);
    return result;
  }
}
