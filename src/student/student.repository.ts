import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@src/configs/prisma/prisma.service';
import { Prisma } from '@src/generated/prisma/client';

@Injectable()
export class StudentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getStudentOrThrow(id: number) {
    const student = await this.prisma.student.findUnique({ where: { id, deletedAt: null } });
    if (!student) throw new NotFoundException('not found student');
    return student;
  }

  async createStudent(student: Prisma.StudentCreateInput) {
    return await this.prisma.student.create({ data: student });
  }

  async updateStudent(id: number, student: Prisma.StudentUpdateInput) {
    return await this.prisma.student.update({ where: { id }, data: student });
  }
}
