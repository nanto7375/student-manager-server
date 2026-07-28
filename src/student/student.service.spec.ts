import { DuplicateActivityRecordException } from '@src/activity/activity.exception';
import { ActivityService } from '@src/activity/activity.service';
import { DateService } from '@src/common/utils/date';
import { PrismaService } from '@src/configs/prisma/prisma.service';
import { ScheduleService } from '@src/schedule/schedule.service';

import { StudentBuilder } from './student.builder';
import { StudentService } from './student.service';

describe('StudentService', () => {
  let service: StudentService;
  let scheduleService: {
    getScheduleOrThrow: jest.Mock;
  };
  let activityService: {
    createMakeupActivityRecord: jest.Mock;
  };

  beforeEach(() => {
    scheduleService = {
      getScheduleOrThrow: jest.fn().mockResolvedValue({ id: 2 }),
    };
    activityService = {
      createMakeupActivityRecord: jest.fn(),
    };
    service = new StudentService({} as PrismaService, {} as StudentBuilder, scheduleService as unknown as ScheduleService, activityService as unknown as ActivityService, new DateService());
    jest.spyOn(service, 'getStudentOrThrow').mockResolvedValue({ id: 1 } as never);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('delegates makeup record creation after validating the student and schedule', async () => {
    const movedAt = new Date('2026-07-20T00:00:00.000Z');

    await service.registerMakeupSchedule({
      studentId: 1,
      scheduleId: 2,
      dateForMakeup: '20260728',
      movedAt,
    });

    expect(service.getStudentOrThrow).toHaveBeenCalledWith(1);
    expect(scheduleService.getScheduleOrThrow).toHaveBeenCalledWith(2);
    expect(activityService.createMakeupActivityRecord).toHaveBeenCalledWith({
      studentId: 1,
      scheduleId: 2,
      date: '20260728',
      movedAt,
    });
  });

  it('does not swallow duplicate activity record errors', async () => {
    const duplicateError = new DuplicateActivityRecordException();
    activityService.createMakeupActivityRecord.mockRejectedValue(duplicateError);

    await expect(
      service.registerMakeupSchedule({
        studentId: 1,
        scheduleId: 2,
        dateForMakeup: '20260728',
      }),
    ).rejects.toBe(duplicateError);
  });
});
