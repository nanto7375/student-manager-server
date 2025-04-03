import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClassSchedule } from './entity/class-schedule.entity';
import { Repository } from 'typeorm';
import { RegisterScheduleRequestDto } from './dto/schedule-request.dto';
import { mapDayOfWeekToNumber } from '@src/common/constant/date.const';

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

  async getSchedules() {
    const schedules = await this.scheduleRepository.find();
    schedules.sort((a, b) => {
      const aDayOfWeek = mapDayOfWeekToNumber[a.dayOfWeek];
      const bDayOfWeek = mapDayOfWeekToNumber[b.dayOfWeek];
      if (aDayOfWeek === bDayOfWeek) return a.startTime.localeCompare(b.startTime);
      return aDayOfWeek - bDayOfWeek;
    });
    return schedules;
  }

  async registerSchedule(scheduleDto: RegisterScheduleRequestDto) {
    const schedule = ClassSchedule.of(scheduleDto);
    return this.scheduleRepository.save(schedule);
  }
}
