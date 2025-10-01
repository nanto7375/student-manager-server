import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Student } from '@src/student/entity/student.entity';
import { DayOfWeek } from '@src/common/constant/date.const';

@Entity()
export class ClassSchedule {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ type: 'char', length: 1, comment: '월,화,수,목,금,토,일' })
  dayOfWeek: DayOfWeek;

  @Column({ type: 'char', length: 4, comment: 'HHMM' })
  startTime: string;

  @Column({ type: 'char', length: 4, comment: 'HHMM' })
  endTime: string;

  @OneToMany(() => Student, (student) => student.classSchedule)
  students: Student[];

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt: Date;

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
