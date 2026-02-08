import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@src/configs/prisma/prisma.service';
import { Schedule as ScheduleModel } from '@src/generated/prisma/client';

export const LessonName = {
  '101': '논술',
};

@Injectable()
export class ScheduleService {
  constructor(private readonly prisma: PrismaService) {}

  async getScheduleOrThrow(id: number) {
    const schedule = await this.prisma.schedule.findUnique({ where: { id } });
    if (!schedule) throw new NotFoundException('not found schedule');
    return schedule;
  }

  async getSchedules(): Promise<ScheduleModel[]> {
    const schedules = await this.prisma.schedule.findMany();
    return schedules;
  }

  async getSchedulesWithStudents() {
    return await this.prisma.schedule.findMany({ include: { students: true } });
  }
}
