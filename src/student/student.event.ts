import { EventEmitter2 } from '@nestjs/event-emitter';
import { Student, Schedule } from '@src/generated/prisma/client';
import { STUDENT_SCHEDULE_CHANGED, STUDENT_SCHEDULE_REGISTERED } from '@src/common/constant/event.const';

export class StudentScheduleRegisteredEvent {
  constructor(
    public readonly student: Student,
    public readonly schedule: Schedule,
  ) {}
}

export class StudentEvent {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  studentScheduleRegistered(student: Student, schedule: Schedule) {
    const event = new StudentScheduleRegisteredEvent(student, schedule);
    this.eventEmitter.emit(STUDENT_SCHEDULE_REGISTERED, event);
  }

  studentScheduleChanged(student: Student, schedule: Schedule) {
    const event = new StudentScheduleRegisteredEvent(student, schedule);
    this.eventEmitter.emit(STUDENT_SCHEDULE_CHANGED, event);
  }
}
