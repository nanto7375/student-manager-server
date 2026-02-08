import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@src/configs/prisma/prisma.service';

export const LessonName = {
  '101': '논술',
};

@Injectable()
export class ScheduleService {
  constructor(private readonly prisma: PrismaService) {}

  async getScheduleOrThrow(id: number) {
    const schedule = await this.prisma.schedule.findUnique({ where: { id, deletedAt: null } });
    if (!schedule) throw new NotFoundException('not found schedule');
    return schedule;
  }

  async getSchedules(): Promise<ScheduleResult[]> {
    const schedules = await this.prisma.schedule.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        lessonId: true,
        dayOfWeek: true,
        lesson: { select: { id: true, code: true, name: true } },
      },
    });
    return schedules;
  }

  async getSchedulesWithStudents() {
    return await this.prisma.schedule.findMany({ where: { deletedAt: null }, include: { students: true } });
  }
}

export type ScheduleResult = {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  lessonId: number;
  lesson: { id: number; code: string; name: string };
};
