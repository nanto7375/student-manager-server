import { DateService } from '@src/common/utils/date';
import { PrismaService } from '@src/configs/prisma/prisma.service';

import { ActivityService } from './activity.service';

describe('ActivityService', () => {
  let service: ActivityService;
  let activityRecord: {
    create: jest.Mock;
    findFirst: jest.Mock;
    upsert: jest.Mock;
  };

  beforeEach(() => {
    activityRecord = {
      create: jest.fn(),
      findFirst: jest.fn(),
      upsert: jest.fn(),
    };
    const prisma = { activityRecord } as unknown as PrismaService;
    service = new ActivityService(prisma, new DateService());
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it.each([false, true])('uses isMakeup as part of the database unique key when it is %s', async (isMakeup) => {
    await service.generateActivityRecord({
      studentId: 1,
      scheduleId: 2,
      date: '20260728',
      isMakeup,
    });

    expect(activityRecord.upsert).toHaveBeenCalledWith({
      where: {
        studentId_scheduleId_date_isMakeup: {
          studentId: 1,
          scheduleId: 2,
          date: '20260728',
          isMakeup,
        },
      },
      create: {
        student: { connect: { id: 1 } },
        scheduleId: 2,
        date: '20260728',
        isMakeup,
      },
      update: {},
    });
  });

  it.each([
    [{ id: 1 }, true],
    [null, false],
  ])('checks for an existing record without using isMakeup', async (record, expected) => {
    activityRecord.findFirst.mockResolvedValue(record);

    await expect(
      service.hasActivityRecord({
        studentId: 1,
        scheduleId: 2,
        date: '20260728',
      }),
    ).resolves.toBe(expected);

    expect(activityRecord.findFirst).toHaveBeenCalledWith({
      where: {
        studentId: 1,
        scheduleId: 2,
        date: '20260728',
      },
      select: { id: true },
    });
  });

  it('strictly creates an activity record so the database can reject duplicates', async () => {
    await service.createActivityRecord({
      studentId: 1,
      scheduleId: 2,
      date: '20260728',
      isMakeup: true,
    });

    expect(activityRecord.create).toHaveBeenCalledWith({
      data: {
        student: { connect: { id: 1 } },
        scheduleId: 2,
        date: '20260728',
        isMakeup: true,
      },
    });
  });
});
