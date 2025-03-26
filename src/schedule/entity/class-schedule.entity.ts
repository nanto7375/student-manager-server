import { Student } from '@src/student/entity/student.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

export enum DayOfWeek {
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
  SUNDAY = 7,
}

@Entity()
export class ClassSchedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  dayOfWeek: number;

  @Column()
  startTime: Date;

  @Column()
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
