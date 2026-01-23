import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ScheduleService } from './schedule.service';

import { AdminRoleType } from '@src/admin/entity/admin.entity';
import { AdminLevel } from '@src/admin/decorator/admin-level.decorator';

import { toInstance } from '@src/common/utils/toInstance';
import { ScheduleDto } from './dto/schedule-response.dto';

@Controller('schedules')
@ApiTags('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get()
  @ApiOperation({ summary: '수업 시간 목록 조회' })
  @ApiOkResponse({ type: [ScheduleDto] })
  async getSchedules() {
    const schedules = await this.scheduleService.getSchedules();
    return toInstance(ScheduleDto, schedules);
  }
}
