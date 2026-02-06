import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Schedule } from './entity/schedule.entity';
import { PrismaService } from '@src/configs/prisma/prisma.service';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    private readonly prisma: PrismaService,
  ) {}

  async getScheduleOrThrow(id: number) {
    const schedule = await this.scheduleRepository.findOne({ where: { id } });
    if (!schedule) throw new NotFoundException('not found schedule');
    return schedule;
  }

  async getSchedules() {
    const schedules = await this.prisma.schedule.findMany();
    console.log(schedules);
    return schedules;
    // return await this.scheduleRepository.find({ cache: 1_000 * 60 * 10 });
  }

  async getSchedulesWithStudents() {
    return await this.scheduleRepository.find({ relations: { students: true } });
  }
}
