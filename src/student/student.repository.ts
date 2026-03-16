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

  async findOrThrow(id: number) {
    const student = await this.prisma.student.findUnique({ where: { id, deletedAt: null } });
    if (!student) throw new NotFoundException('not found student');
    return student;
  }
}

@Injectable()
export class AssessmentRepository {
  private readonly prismaAssessment;
  constructor(
    private readonly prisma: PrismaService,
    private readonly dateService: DateService,
  ) {
    this.prismaAssessment = this.prisma.assessment;
  }

  get _() {
    return this.prismaAssessment;
  }

  async findOrThrow(id: number) {
    const assessment = await this.prismaAssessment.findUnique({ where: { id } });
    if (!assessment) throw new NotFoundException();
    if (assessment.deletedAt) throw new BadRequestException();
    return assessment;
  }

  async softDelete(id: number) {
    await this.prismaAssessment.update({ where: { id }, data: { deletedAt: this.dateService.now() } });
    return true;
  }
}
