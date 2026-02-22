import { BadRequestException, Injectable } from '@nestjs/common';

import { ActivityRecord, Student, BookRental } from '@src/generated/prisma/client';
import { ActivityRecordGenerationLogRepository, ActivityRecordLogRepository, ActivityRepository, BookRentalRepository } from './activity.repository';

import { ActivityEvent } from './activity.event';
import { StudentService } from '@src/student/student.service';
import { DateService } from '@src/common/utils/date';

import { UpdateActivityRecordRequestDto } from './dto/activity.request.dto';

/**
 * @description ARGL: ActivityRecordGenerationLog
 */
@Injectable()
export class ActivityService {
  constructor(
    private readonly activityEvent: ActivityEvent,
    private readonly activityRepository: ActivityRepository,
    private readonly activityRecordLogRepository: ActivityRecordLogRepository,
    private readonly activityRecordGenerationLogRepository: ActivityRecordGenerationLogRepository,
    private readonly bookRentalRepository: BookRentalRepository,
    private readonly studentService: StudentService,
    private readonly date: DateService,
  ) {}

  async getDailyActivityRecords({ scheduleId, date }: { scheduleId: number; date: string }) {
    const activityRecords: ActivityRecordWithBorrowedBook[] = await this.activityRepository.findMany({
      where: { date, student: { scheduleId } },
      include: {
        student: {
          include: {
            bookRentals: {
              where: { returnedAt: null },
              take: 1,
              orderBy: { borrowedAt: 'desc' },
            },
          },
        },
      },
      orderBy: { student: { name: 'asc' } },
    });

    return activityRecords.map((record) => ({
      ...record,
      borrowedBook: record.student.bookRentals?.[0] ? { ...record.student.bookRentals[0] } : null,
    }));
  }

  async generateThisMonthActivityRecords({ students, dayOfWeek, yearMonth }: { students: Student[]; dayOfWeek: number; yearMonth: string }) {
    const dates = this.date.getDatesInMonthCorrespondingToDayOfWeek({ yearMonth, dayOfWeek });
    const activityRecords = students.flatMap((student) => dates.map((date) => ({ studentId: student.id, date })));
    return await this.activityRepository.createMany(activityRecords);
  }

  async generateARGLs({ yearMonth }: { yearMonth: string }) {
    return await this.activityRecordGenerationLogRepository.create({ generatedActivityYearMonth: yearMonth });
  }

  async getARGLsInThisMonth(yearMonth: string) {
    const activityGenerationLogs = await this.activityRecordGenerationLogRepository.findBy({ generatedActivityYearMonth: yearMonth });
    return activityGenerationLogs;
  }

  async updateActivityRecord({ activityRecordId, activityRecordDto, adminId }: { activityRecordId: number; activityRecordDto: UpdateActivityRecordRequestDto; adminId: number }) {
    const activityRecord = await this.activityRepository.findOrThrow(activityRecordId);
    const { activityKey: key, activityValue: value } = activityRecordDto;

    if (!Object.keys(activityRecord).includes(key)) {
      throw new BadRequestException('invalid activity key');
    }

    const body = { [key]: value };
    const result = await this.activityRepository.update(activityRecordId, body);

    this.activityEvent.activityRecordUpdated({ adminId, activityRecordId, key, value });
    return result;
  }

  async generateActivityRecordLog({ activityRecordId, adminId, key, value }: { activityRecordId: number; adminId: number; key: string; value: string }) {
    return await this.activityRecordLogRepository.create({ activityRecordId, adminId, key, value });
  }

  async participateMonthlyProject(activityRecordId: number, { adminId }: { adminId: number }) {
    const activityRecord = await this.activityRepository.findOrThrow(activityRecordId);
    if (activityRecord.monthlyProject) throw new BadRequestException('already participated');

    const yearMonth = activityRecord.date.substring(0, 7);
    const updatedActivityRecord = await this.activityRepository.updateMany(
      {
        studentId: activityRecord.studentId,
        date: { startsWith: yearMonth, gte: activityRecord.date },
      },
      { monthlyProject: true },
    );
    this.activityEvent.activityRecordUpdated({ adminId, activityRecordId, key: 'monthlyProject', value: true });
    return updatedActivityRecord;
  }

  async borrowBook({ studentId, bookTitle }: { studentId: number; bookTitle: string }) {
    const student = await this.studentService.getStudentOrThrow(studentId);
    const activeBorrow = await this.bookRentalRepository.findActiveByStudentId(student.id);
    if (activeBorrow) throw new BadRequestException('이미 대여 중인 책이 있습니다');

    return await this.bookRentalRepository.create({
      student: { connect: { id: student.id } },
      bookTitle,
    });
  }

  async returnBook(bookRentalId: number) {
    const bookRental = await this.bookRentalRepository.findOrThrow(bookRentalId);
    if (bookRental.returnedAt) throw new BadRequestException('이미 반납된 책입니다');

    return await this.bookRentalRepository.returnBook(bookRentalId);
  }

  async recordBorrowedBookTitle(bookRentalId: number, bookTitle: string) {
    const bookRental = await this.bookRentalRepository.findOrThrow(bookRentalId);
    if (bookRental.returnedAt) throw new BadRequestException('이미 반납된 책입니다');

    return await this.bookRentalRepository.update(bookRentalId, { bookTitle });
  }
}

type ActivityRecordWithBorrowedBook = ActivityRecord & { student: Student & { bookRentals: BookRental[] } };
