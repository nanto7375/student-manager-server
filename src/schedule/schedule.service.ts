import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClassSchedule } from './entity/class-schedule.entity';
import { Repository } from 'typeorm';
import { RegisterScheduleRequestDto } from './dto/schedule-request.dto';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(ClassSchedule)
    private readonly scheduleRepository: Repository<ClassSchedule>,
  ) {}

  async getClassScheduleOrThrow(id: number) {
    const schedule = await this.scheduleRepository.findOne({ where: { id } });
    if (!schedule) throw new NotFoundException('schedule not found');
    return schedule;
  }

  async registerSchedule(scheduleDto: RegisterScheduleRequestDto) {
    const schedule = ClassSchedule.of(scheduleDto);
    return this.scheduleRepository.save(schedule);
  }
}
