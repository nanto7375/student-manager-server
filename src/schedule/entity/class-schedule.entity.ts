import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Student } from '@src/student/entity/student.entity';
import { DayOfWeek } from '@src/common/constant/date.const';

@Entity()
export class ClassSchedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: '월,화,수,목,금,토,일' })
  dayOfWeek: string;

  @Column({ comment: 'HHMM' })
  startTime: string;

  @Column({ comment: 'HHMM' })
  endTime: string;

  @OneToMany(() => Student, (student) => student.classSchedule)
  students: Student[];

  static of(classScheduleDto: ClassScheduleOf) {
    const classSchedule = new ClassSchedule();
    classSchedule.dayOfWeek = classScheduleDto.dayOfWeek;
    classSchedule.startTime = classScheduleDto.startTime;
    classSchedule.endTime = classScheduleDto.endTime;
    return classSchedule;
  }
}

type ClassScheduleOf = {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
};
