import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';

import { DateService } from '@src/common/utils/date';
import { MyLogger } from '@src/configs/logger/my-logger';
import { MailService } from '@src/mail/mail.service';
import { ScheduleService } from '@src/schedule/schedule.service';

import { ActivityService } from './activity.service';
import { ActivityTask } from './activity.task';

describe('ActivityTask', () => {
  let task: ActivityTask;
  let activityService: {
    findActivityRecordGenerationLog: jest.Mock;
    ensureScheduledActivityRecords: jest.Mock;
    createActivityRecordGenerationLog: jest.Mock;
  };
  let scheduleService: {
    getSchedulesWithStudents: jest.Mock;
  };
  let logger: {
    setContext: jest.Mock;
    log: jest.Mock;
    error: jest.Mock;
  };
  let mailService: {
    sendErrorAlert: jest.Mock;
  };
  let transactionHost: {
    withTransaction: jest.Mock;
  };

  beforeEach(() => {
    activityService = {
      findActivityRecordGenerationLog: jest.fn(),
      ensureScheduledActivityRecords: jest.fn(),
      createActivityRecordGenerationLog: jest.fn(),
    };
    scheduleService = {
      getSchedulesWithStudents: jest.fn().mockResolvedValue([
        {
          id: 3,
          dayOfWeek: 2,
          students: [{ id: 10 }, { id: 11 }],
        },
      ]),
    };
    logger = {
      setContext: jest.fn(),
      log: jest.fn(),
      error: jest.fn(),
    };
    mailService = {
      sendErrorAlert: jest.fn(),
    };
    transactionHost = {
      withTransaction: jest.fn(async (...args: unknown[]) => {
        const callback = args.find((arg) => typeof arg === 'function') as () => Promise<unknown>;
        return callback();
      }),
    };
    const date = {
      currentYearMonth: jest.fn().mockReturnValue('202608'),
      addMonthsToYearMonth: jest.fn().mockReturnValue('202609'),
    } as unknown as DateService;

    task = new ActivityTask(
      activityService as unknown as ActivityService,
      scheduleService as unknown as ScheduleService,
      logger as unknown as MyLogger,
      date,
      mailService as unknown as MailService,
      transactionHost as unknown as TransactionHost<TransactionalAdapterPrisma>,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('uses one transaction per target month and skips a month that was already generated', async () => {
    activityService.findActivityRecordGenerationLog.mockResolvedValueOnce({ id: 1 }).mockResolvedValueOnce(null);

    await task.generateActivityRecordsForAllStudents();

    expect(transactionHost.withTransaction).toHaveBeenCalledTimes(2);
    expect(scheduleService.getSchedulesWithStudents).toHaveBeenCalledTimes(1);
    expect(activityService.ensureScheduledActivityRecords).toHaveBeenCalledWith({
      studentIds: [10, 11],
      scheduleId: 3,
      dayOfWeek: 2,
      yearMonth: '202609',
    });
    expect(activityService.createActivityRecordGenerationLog).toHaveBeenCalledWith('202609');
  });

  it('retries when starting a monthly transaction fails', async () => {
    jest.useFakeTimers();
    const transactionError = new Error('transaction unavailable');
    transactionHost.withTransaction.mockRejectedValueOnce(transactionError).mockImplementation(async (...args: unknown[]) => {
      const callback = args.find((arg) => typeof arg === 'function') as () => Promise<unknown>;
      return callback();
    });
    activityService.findActivityRecordGenerationLog.mockResolvedValue({ id: 1 });

    await task.generateActivityRecordsForAllStudents();
    await jest.advanceTimersByTimeAsync(5 * 60 * 1000);

    expect(logger.error).toHaveBeenCalledWith(transactionError);
    expect(transactionHost.withTransaction).toHaveBeenCalledTimes(3);
  });
});
