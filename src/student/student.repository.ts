import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@src/configs/prisma/prisma.service';
import { Prisma } from '@src/generated/prisma/client';

@Injectable()
export class StudentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findOrThrow(id: number) {
    const student = await this.prisma.student.findUnique({ where: { id, deletedAt: null } });
    if (!student) throw new NotFoundException('not found student');
    return student;
  }

  async create(body: Prisma.StudentCreateInput) {
    return await this.prisma.student.create({ data: body });
  }

  async update(id: number, data: Prisma.StudentUpdateInput) {
    return await this.prisma.student.update({ where: { id }, data });
  }
}

@Injectable()
export class AssessmentRepository {
  private readonly prismaAssessment;
  constructor(private readonly prisma: PrismaService) {
    this.prismaAssessment = this.prisma.assessment;
  }

  get _() {
    return this.prismaAssessment;
  }

  async findOrThrow(id: number) {
    const assessment = await this.prismaAssessment.findUnique({ where: { id } });
    if (!assessment) throw new NotFoundException();
    return assessment;
  }
}
