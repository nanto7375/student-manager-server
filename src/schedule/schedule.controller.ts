import { Body, Controller, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Auth } from '@src/auth/auth.decorator';
import { AdminRoleType } from '@src/admin/entity/admin.entity';
import { ScheduleService } from './schedule.service';

import { toInstance } from '@src/common/utils/toInstance';
import { RegisterScheduleRequestDto } from './dto/schedule-request.dto';
import { ScheduleDto } from './dto/schedule-response.dto';

@Controller('schedules')
@ApiTags('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  @Auth(AdminRoleType.SUPER_ADMIN)
  @ApiOperation({ summary: '스케쥴 등록' })
  @ApiOkResponse({ type: ScheduleDto })
  async registerSchedule(@Body() scheduleDto: RegisterScheduleRequestDto) {
    return toInstance(ScheduleDto, await this.scheduleService.registerSchedule(scheduleDto));
  }
}
