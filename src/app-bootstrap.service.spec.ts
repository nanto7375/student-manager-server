import { ActivityTask } from './activity/activity.task';
import { AppBootstrapService } from './app-bootstrap.service';
import { MyLogger } from './configs/logger/my-logger';
import { PrismaService } from './configs/prisma/prisma.service';
import { StudentTask } from './student/student.task';

describe('AppBootstrapService', () => {
  let service: AppBootstrapService;
  let queryRaw: jest.Mock;
  let generateActivityRecords: jest.Mock;
  let changeSchedule: jest.Mock;
  let logger: {
    log: jest.Mock;
    error: jest.Mock;
  };

  beforeEach(() => {
    jest.useFakeTimers();
    queryRaw = jest.fn();
    generateActivityRecords = jest.fn();
    changeSchedule = jest.fn();
    logger = {
      log: jest.fn(),
      error: jest.fn(),
    };

    service = new AppBootstrapService(
      { generateActivityRecordsForAllStudents: generateActivityRecords } as unknown as ActivityTask,
      { changeSchedule } as unknown as StudentTask,
      { $queryRawUnsafe: queryRaw } as unknown as PrismaService,
      logger as unknown as MyLogger,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('fails bootstrap with the database error after connection retries are exhausted', async () => {
    const databaseError = new Error('database unavailable');
    queryRaw.mockRejectedValue(databaseError);

    const bootstrap = expect(service.onApplicationBootstrap()).rejects.toBe(databaseError);
    await jest.runAllTimersAsync();
    await bootstrap;

    expect(queryRaw).toHaveBeenCalledTimes(5);
    expect(generateActivityRecords).not.toHaveBeenCalled();
    expect(changeSchedule).not.toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledWith(databaseError);
  });

  it('logs the duration of each successful bootstrap task', async () => {
    queryRaw.mockResolvedValue([{ connected: 1 }]);
    generateActivityRecords.mockResolvedValue(undefined);
    changeSchedule.mockResolvedValue(undefined);
    jest.spyOn(Date, 'now').mockReturnValueOnce(100).mockReturnValueOnce(125).mockReturnValueOnce(200).mockReturnValueOnce(240);

    await service.onApplicationBootstrap();

    expect(logger.log.mock.calls).toEqual([['Activity record generation started'], ['Activity record generation completed (25ms)'], ['Schedule change started'], ['Schedule change completed (40ms)'], ['Application bootstrap completed']]);
  });
});
