import { DuplicateActivityRecordException, DUPLICATE_ACTIVITY_RECORD_ERROR } from '@src/activity/activity.exception';
import { ActivityService } from '@src/activity/activity.service';
import { DateService } from '@src/common/utils/date';
import { PrismaService } from '@src/configs/prisma/prisma.service';
import { Prisma } from '@src/generated/prisma/client';
import { ScheduleService } from '@src/schedule/schedule.service';

import { StudentBuilder } from './student.builder';
import { StudentService } from './student.service';

describe('StudentService', () => {
  let service: StudentService;
  let scheduleService: {
    getScheduleOrThrow: jest.Mock;
  };
  let activityService: {
    createActivityRecord: jest.Mock;
    hasActivityRecord: jest.Mock;
  };

  beforeEach(() => {
    scheduleService = {
      getScheduleOrThrow: jest.fn().mockResolvedValue({ id: 2 }),
    };
    activityService = {
      createActivityRecord: jest.fn(),
      hasActivityRecord: jest.fn().mockResolvedValue(false),
    };
    service = new StudentService({} as PrismaService, {} as StudentBuilder, scheduleService as unknown as ScheduleService, activityService as unknown as ActivityService, new DateService());
    jest.spyOn(service, 'getStudentOrThrow').mockResolvedValue({ id: 1 } as never);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('rejects a makeup lesson when any activity record already exists for the same schedule and date', async () => {
    activityService.hasActivityRecord.mockResolvedValue(true);

    await expect(
      service.registerMakeupSchedule({
        studentId: 1,
        scheduleId: 2,
        dateForMakeup: '20260728',
      }),
    ).rejects.toBeInstanceOf(DuplicateActivityRecordException);
    expect(activityService.createActivityRecord).not.toHaveBeenCalled();
  });

  it('throws a dedicated conflict error when a makeup activity record is duplicated', async () => {
    activityService.createActivityRecord.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );

    const request = service.registerMakeupSchedule({
      studentId: 1,
      scheduleId: 2,
      dateForMakeup: '20260728',
    });

    await expect(request).rejects.toBeInstanceOf(DuplicateActivityRecordException);
    await expect(request).rejects.toMatchObject({
      status: 409,
      message: DUPLICATE_ACTIVITY_RECORD_ERROR,
    });
  });

  it('does not replace non-unique database errors', async () => {
    const databaseError = new Error('database unavailable');
    activityService.createActivityRecord.mockRejectedValue(databaseError);

    await expect(
      service.registerMakeupSchedule({
        studentId: 1,
        scheduleId: 2,
        dateForMakeup: '20260728',
      }),
    ).rejects.toBe(databaseError);
  });
});
