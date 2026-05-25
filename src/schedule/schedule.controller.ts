import { Controller, Delete, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { toInstance } from '@src/common/utils/toInstance';
import { ScheduleDto } from './dto/schedule-response.dto';
import { ScheduleService } from './schedule.service';
import { RequireRole } from '@src/admin/decorator/require-role.decorator';
import { AdminRoleType } from '@src/admin/admin.service';

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

  @Get('reserved')
  @Delete('reserved/:reservationId')
  @RequireRole(AdminRoleType.ADMIN)
  @ApiOperation({ summary: '예약된 수업 시간 삭제' })
  @ApiOkResponse({ description: '예약 삭제 성공' })
  async deleteReservedSchedule(@Param('reservationId', ParseIntPipe) reservationId: number) {
    await this.scheduleService.deleteReservedSchedule(reservationId);
  }
}
