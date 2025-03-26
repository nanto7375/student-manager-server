import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Student } from '@src/student/entity/student.entity';
import { DayOfWeek } from '@src/common/constant/date.const';

@Entity()
export class ClassSchedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: '1~7, 1=월요일' })
  dayOfWeek: number;

  @Column({ comment: 'HHMM' })
  startTime: Date;

  @Column({ comment: 'HHMM' })
  endTime: Date;

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
  startTime: Date;
  endTime: Date;
};
