import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Schedule } from './entity/schedule.entity';
import { Repository } from 'typeorm';
import { RegisterScheduleRequestDto } from './dto/schedule-request.dto';
import { DateUtils } from '@src/common/utils/date';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
  ) {}
}
