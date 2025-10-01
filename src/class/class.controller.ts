import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AdminRoleType } from '@src/admin/entity/admin.entity';
import { ClassService } from './class.service';

import { toInstance } from '@src/common/utils/toInstance';
import { RegisterScheduleRequestDto } from './dto/class-request.dto';
import { ClassScheduleDto } from './dto/class-response.dto';
import { AdminLevel } from '@src/admin/decorator/admin-level.decorator';

@Controller('class')
@ApiTags('class')
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  @Get('schedules')
  @ApiOperation({ summary: '스케쥴 조회' })
  @ApiOkResponse({ type: [ClassScheduleDto] })
  async getSchedules() {
    return toInstance(ClassScheduleDto, await this.classService.getSchedules());
  }

  @Post()
  @AdminLevel(AdminRoleType.SUPER_ADMIN)
  @ApiOperation({ summary: '스케쥴 등록' })
  @ApiOkResponse({ type: ClassScheduleDto })
  async registerSchedule(@Body() scheduleDto: RegisterScheduleRequestDto) {
    return toInstance(ClassScheduleDto, await this.classService.registerSchedule(scheduleDto));
  }
}
