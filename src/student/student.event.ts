import { Schedule } from '@src/schedule/entity/schedule.entity';
import { Student } from './entity/student.entity';

export class StudentScheduleRegisteredEvent {
  constructor(
    public readonly student: Student,
    public readonly schedule: Schedule,
  ) {}
}
