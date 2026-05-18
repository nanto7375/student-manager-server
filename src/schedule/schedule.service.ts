import { Transactional } from '@nestjs-cls/transactional';
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

  @Transactional()
  async reserveScheduleChange({ studentId, scheduleId, date }: ChangeScheduleParams) {
    await this.prisma.scheduleChangeReservation.deleteMany({ where: { studentId, completedAt: null } });
    await this.prisma.scheduleChangeReservation.create({
      data: {
        studentId,
        scheduleId,
        date,
      },
    });
    return true;
  }

  async getReservedScheduleChanges(date: string) {
    return await this.prisma.scheduleChangeReservation.findMany({
      where: { date, completedAt: null },
    });
  }

  async completeReservedScheduleChange({ studentId, scheduleId, date }: { studentId: number; scheduleId: number; date: string }) {
    await this.prisma.scheduleChangeReservation.updateMany({
      where: { studentId, scheduleId, date, completedAt: null },
      data: { completedAt: new Date() },
    });
    return true;
  }

  async deleteReservedScheduleChanges(studentId: number) {
    await this.prisma.scheduleChangeReservation.deleteMany({ where: { studentId, completedAt: null } });
    return true;
  }

  async deleteReservedSchedule(reservationId: number) {
    await this.prisma.scheduleChangeReservation.delete({ where: { id: reservationId } });
    return true;
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
type ChangeScheduleParams = {
  studentId: number;
  scheduleId: number;
  date: string; // YYYYMMDD
};
