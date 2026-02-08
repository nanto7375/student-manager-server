import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@src/configs/prisma/prisma.service';
import { Prisma } from '@src/generated/prisma/client';

@Injectable()
export class ActivityRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getActivityRecordOrThrow(id: number) {
    const activityRecord = await this.prisma.activityRecord.findUnique({ where: { id } });
    if (!activityRecord || activityRecord) throw new NotFoundException('not found activity record');
    return activityRecord;
  }
  async getActivityRecordList({ where, include }: { where: Prisma.ActivityRecordWhereInput; include: Prisma.ActivityRecordInclude }) {
    return await this.prisma.activityRecord.findMany({ where, include });
  }
  async getActivityRecordGenerationLogBy(where: Prisma.ActivityRecordGenerationLogWhereInput) {
    return await this.prisma.activityRecordGenerationLog.findFirst({ where });
  }
  async createActivityRecord(activityRecord: Prisma.ActivityRecordCreateInput) {
    return await this.prisma.activityRecord.create({ data: activityRecord });
  }
  async createManyActivityRecords(activityRecords: Prisma.ActivityRecordCreateManyInput[]) {
    return await this.prisma.activityRecord.createMany({ data: activityRecords });
  }
  async updateActivityRecord(id: number, activityRecord: Prisma.ActivityRecordUpdateInput) {
    return await this.prisma.activityRecord.update({ where: { id }, data: activityRecord });
  }
  async createActivityRecordLog({ activityRecordId, adminId, key, value }: { activityRecordId: number; adminId: number; key: string; value: string }) {
    return await this.prisma.activityRecordLog.create({ data: { activityRecordId, adminId, key, value } });
  }
  async createActivityRecordGenerationLog({ generatedActivityYearMonth }: { generatedActivityYearMonth: string }) {
    return await this.prisma.activityRecordGenerationLog.create({ data: { generatedActivityYearMonth } });
  }
}
