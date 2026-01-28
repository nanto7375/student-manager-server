import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Schedule } from './entity/schedule.entity';

import { DateUtils } from '@src/common/utils/date';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
  ) {}

  async getScheduleOrThrow(id: number) {
    const schedule = await this.scheduleRepository.findOne({ where: { id } });
    if (!schedule) throw new NotFoundException('not found schedule');
    return schedule;
  }

  async getSchedules() {
    return await this.scheduleRepository.find();
  }
}
