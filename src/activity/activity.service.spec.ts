import { DateService } from '@src/common/utils/date';
import { PrismaService } from '@src/configs/prisma/prisma.service';
import { Prisma } from '@src/generated/prisma/client';

import { DuplicateActivityRecordException, DUPLICATE_ACTIVITY_RECORD_ERROR } from './activity.exception';
import { ActivityService } from './activity.service';

describe('ActivityService', () => {
  let service: ActivityService;
  let activityRecord: {
    create: jest.Mock;
    createMany: jest.Mock;
    findFirst: jest.Mock;
  };

  beforeEach(() => {
    activityRecord = {
      create: jest.fn(),
      createMany: jest.fn(),
      findFirst: jest.fn(),
    };
    const prisma = { activityRecord } as unknown as PrismaService;
    service = new ActivityService(prisma, new DateService());
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createMakeupActivityRecord', () => {
    const params = {
      studentId: 1,
      scheduleId: 2,
      date: '20260728',
    };

    it('rejects creation when any record already exists for the same student, schedule, and date', async () => {
      activityRecord.findFirst.mockResolvedValue({ id: 10 });

      await expect(service.createMakeupActivityRecord(params)).rejects.toBeInstanceOf(DuplicateActivityRecordException);
      expect(activityRecord.findFirst).toHaveBeenCalledWith({
        where: params,
        select: { id: true },
      });
      expect(activityRecord.create).not.toHaveBeenCalled();
    });

    it('creates a makeup record after the availability check', async () => {
      const movedAt = new Date('2026-07-20T00:00:00.000Z');
      activityRecord.findFirst.mockResolvedValue(null);

      await service.createMakeupActivityRecord({ ...params, movedAt });

      expect(activityRecord.create).toHaveBeenCalledWith({
        data: {
          student: { connect: { id: 1 } },
          scheduleId: 2,
          date: '20260728',
          isMakeup: true,
          movedAt,
        },
      });
    });

    it('copies the monthly project status from another record for the same student and month', async () => {
      activityRecord.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce({ monthlyProject: 'preview' });

      await service.createMakeupActivityRecord(params);

      expect(activityRecord.findFirst).toHaveBeenNthCalledWith(2, {
        where: {
          studentId: 1,
          date: { startsWith: '202607' },
        },
        select: { monthlyProject: true },
      });
      expect(activityRecord.create).toHaveBeenCalledWith({
        data: {
          student: { connect: { id: 1 } },
          scheduleId: 2,
          date: '20260728',
          isMakeup: true,
          monthlyProject: 'preview',
        },
      });
    });

    it('translates a concurrent duplicate into a dedicated conflict error', async () => {
      activityRecord.findFirst.mockResolvedValue(null);
      activityRecord.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: 'test',
        }),
      );

      const request = service.createMakeupActivityRecord(params);

      await expect(request).rejects.toBeInstanceOf(DuplicateActivityRecordException);
      await expect(request).rejects.toMatchObject({
        status: 409,
        message: DUPLICATE_ACTIVITY_RECORD_ERROR,
      });
    });

    it('does not replace non-unique database errors', async () => {
      const databaseError = new Error('database unavailable');
      activityRecord.findFirst.mockResolvedValue(null);
      activityRecord.create.mockRejectedValue(databaseError);

      await expect(service.createMakeupActivityRecord(params)).rejects.toBe(databaseError);
    });
  });

  describe('ensureScheduledActivityRecords', () => {
    it('creates regular records in bulk and skips existing regular records', async () => {
      await service.ensureScheduledActivityRecords({
        studentIds: [1, 3],
        scheduleId: 2,
        dayOfWeek: 2,
        yearMonth: '202607',
      });

      expect(activityRecord.createMany).toHaveBeenCalledWith({
        data: [
          { studentId: 1, scheduleId: 2, date: '20260707' },
          { studentId: 1, scheduleId: 2, date: '20260714' },
          { studentId: 1, scheduleId: 2, date: '20260721' },
          { studentId: 1, scheduleId: 2, date: '20260728' },
          { studentId: 3, scheduleId: 2, date: '20260707' },
          { studentId: 3, scheduleId: 2, date: '20260714' },
          { studentId: 3, scheduleId: 2, date: '20260721' },
          { studentId: 3, scheduleId: 2, date: '20260728' },
        ],
        skipDuplicates: true,
      });
    });
  });
});
