import { Schedule } from '@src/schedule/entity/schedule.entity';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AdminRoleType } from '@src/admin/entity/admin.entity';
import { ScheduleService } from './schedule.service';

import { toInstance } from '@src/common/utils/toInstance';
import { RegisterScheduleRequestDto } from './dto/schedule-request.dto';
import { LessonScheduleDto } from './dto/schedule-response.dto';
import { AdminLevel } from '@src/admin/decorator/admin-level.decorator';

@Controller('schedules')
@ApiTags('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}
}
