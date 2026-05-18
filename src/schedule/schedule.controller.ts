import { Controller, Delete, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { toInstance } from '@src/common/utils/toInstance';
import { ScheduleDto } from './dto/schedule-response.dto';
import { ScheduleService } from './schedule.service';

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

  @Delete('reserved/:reservationId')
  @ApiOperation({ summary: '예약된 수업 시간 삭제' })
  @ApiOkResponse({ description: '예약 삭제 성공' })
  async deleteReservedSchedule(@Param('reservationId') reservationId: number) {
    await this.scheduleService.deleteReservedSchedule(reservationId);
  }
}
