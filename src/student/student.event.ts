import { EventEmitter2 } from '@nestjs/event-emitter';
import { Student, Schedule } from '@src/generated/prisma/client';
import { STUDENT_SCHEDULE_REGISTERED } from '@src/common/constant/event.const';

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

  // TODO: 학생의 스케줄이 변경되는 경우, 기존 스케줄과 새로운 스케줄을 모두 포함하는 이벤트로 변경 필요
  studentScheduleChanged(student: Student, schedule: Schedule) {
    // const event = new StudentScheduleRegisteredEvent(student, schedule);
    // this.eventEmitter.emit(STUDENT_SCHEDULE_REGISTERED, event);
  }
}
