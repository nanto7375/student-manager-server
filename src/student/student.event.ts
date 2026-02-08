import { Student, Schedule } from '@src/generated/prisma/client';

export class StudentScheduleRegisteredEvent {
  constructor(
    public readonly student: Student,
    public readonly schedule: Schedule,
  ) {}
}
