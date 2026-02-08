import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@src/configs/prisma/prisma.service';
import { Prisma } from '@src/generated/prisma/client';

@Injectable()
export class ActivityRepository {
  constructor(private readonly prisma: PrismaService) {}
  async create(activityRecord: Prisma.ActivityRecordCreateInput) {
    return await this.prisma.activityRecord.create({ data: activityRecord });
  }
  async createMany(activityRecords: Prisma.ActivityRecordCreateManyInput[]) {
    return await this.prisma.activityRecord.createMany({ data: activityRecords });
  }
  async update(id: number, activityRecord: Prisma.ActivityRecordUpdateInput) {
    return await this.prisma.activityRecord.update({ where: { id }, data: activityRecord });
  }
  async findOrThrow(id: number) {
    const activityRecord = await this.prisma.activityRecord.findUnique({ where: { id } });
    if (!activityRecord) throw new NotFoundException('not found activity record');
    return activityRecord;
  }
  async findMany({ where, include }: { where: Prisma.ActivityRecordWhereInput; include: Prisma.ActivityRecordInclude }) {
    return await this.prisma.activityRecord.findMany({ where, include });
  }
}

@Injectable()
export class ActivityRecordLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create({ activityRecordId, adminId, key, value }: { activityRecordId: number; adminId: number; key: string; value: string }) {
    return await this.prisma.activityRecordLog.create({ data: { activityRecordId, adminId, key, value } });
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
