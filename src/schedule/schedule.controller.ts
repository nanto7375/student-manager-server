import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AdminRoleType } from '@src/admin/entity/admin.entity';
import { ScheduleService } from './schedule.service';

import { toInstance } from '@src/common/utils/toInstance';
import { RegisterScheduleRequestDto } from './dto/schedule-request.dto';
import { ScheduleDto } from './dto/schedule-response.dto';
import { AdminLevel } from '@src/admin/decorator/admin-level.decorator';

@Controller('schedules')
@ApiTags('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get()
  @ApiOperation({ summary: '스케쥴 조회' })
  @ApiOkResponse({ type: [ScheduleDto] })
  async getSchedules() {
    return toInstance(ScheduleDto, await this.scheduleService.getSchedules());
  }

  @Post()
  @AdminLevel(AdminRoleType.SUPER_ADMIN)
  @ApiOperation({ summary: '스케쥴 등록' })
  @ApiOkResponse({ type: ScheduleDto })
  async registerSchedule(@Body() scheduleDto: RegisterScheduleRequestDto) {
    return toInstance(ScheduleDto, await this.scheduleService.registerSchedule(scheduleDto));
  }
}
