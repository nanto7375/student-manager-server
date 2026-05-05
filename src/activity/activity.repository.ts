import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@src/configs/prisma/prisma.service';
import { Prisma, ActivityRecord } from '@src/generated/prisma/client';

@Injectable()
export class ActivityRepository {
  constructor(private readonly prisma: PrismaService) {}
  async create(activityRecord: Prisma.ActivityRecordCreateInput) {
    return await this.prisma.activityRecord.create({ data: activityRecord });
  }
  async createMany(activityRecords: Prisma.ActivityRecordCreateManyInput[]) {
    return await this.prisma.activityRecord.createMany({ data: activityRecords });
  }
  async update(id: number, body: Prisma.ActivityRecordUpdateInput) {
    return await this.prisma.activityRecord.update({ where: { id }, data: body });
  }
  async updateMany({ where, body }: { where: Prisma.ActivityRecordWhereInput; body: Prisma.ActivityRecordUpdateInput }) {
    return await this.prisma.activityRecord.updateMany({ where, data: body });
  }
  async deleteMany(where: Prisma.ActivityRecordWhereInput) {
    return await this.prisma.activityRecord.deleteMany({ where });
  }
  async findOrThrow(id: number) {
    const activityRecord = await this.prisma.activityRecord.findUnique({ where: { id } });
    if (!activityRecord) throw new NotFoundException('not found activity record');
    return activityRecord;
  }
  async findMany<T = ActivityRecord>({ where, include, orderBy }: Prisma.ActivityRecordFindManyArgs) {
    return (await this.prisma.activityRecord.findMany({ where, include, orderBy })) as T[];
  }
}

@Injectable()
export class ActivityRecordGenerationLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create({ generatedActivityYearMonth }: { generatedActivityYearMonth: string }) {
    return await this.prisma.activityRecordGenerationLog.create({ data: { generatedActivityYearMonth } });
  }

  async findBy(where: Prisma.ActivityRecordGenerationLogWhereInput) {
    return await this.prisma.activityRecordGenerationLog.findFirst({ where });
  }
}
