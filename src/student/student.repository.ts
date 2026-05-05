import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DateService } from '@src/common/utils/date';
import { PrismaService } from '@src/configs/prisma/prisma.service';
import { Prisma } from '@src/generated/prisma/client';

@Injectable()
export class StudentRepository {
  private readonly prismaStudent;
  constructor(private readonly prisma: PrismaService) {
    this.prismaStudent = prisma.student;
  }

  get _() {
    return this.prismaStudent;
  }

  async findOrThrow(id: number, { includeNotes = false, includeScheduleChangeReservations = false } = {}) {
    const student = await this.prisma.student.findUnique({
      where: { id, deletedAt: null },
      include: {
        schedule: { include: { lesson: true } },
        notes: includeNotes ? { where: { deletedAt: null }, include: { lastCommenter: true } } : false,
        scheduleChangeReservations: includeScheduleChangeReservations ? { where: { completedAt: null } } : false,
      },
    });
    if (!student) throw new NotFoundException('not found student');
    return student;
  }
}

@Injectable()
export class NoteRepository {
  private readonly prismaNote;
  constructor(
    private readonly prisma: PrismaService,
    private readonly dateService: DateService,
  ) {
    this.prismaNote = this.prisma.note;
  }

  get _() {
    return this.prismaNote;
  }

  async findOrThrow(id: number) {
    const note = await this.prismaNote.findUnique({ where: { id } });
    if (!note) throw new NotFoundException();
    if (note.deletedAt) throw new BadRequestException();
    return note;
  }

  async softDelete(id: number) {
    await this.prismaNote.update({ where: { id }, data: { deletedAt: this.dateService.now() } });
    return true;
  }
}
