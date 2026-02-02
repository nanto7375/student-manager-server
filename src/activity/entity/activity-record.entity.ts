import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Student } from '@src/student/entity/student.entity';
import { Schedule } from '@src/schedule/entity/schedule.entity';

@Entity()
export class ActivityRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', unsigned: true })
  studentId: number;

  @ManyToOne(() => Student, (student) => student.id, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  student: Student;

  @Column({ type: 'int', unsigned: true })
  scheduleId: number;

  @ManyToOne(() => Schedule, (schedule) => schedule.id, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' })
  schedule: Schedule;

  @Column({ type: 'char', length: 8, comment: 'YYYYMMDD' })
  date: string;

  @Column({ default: false, comment: '대체 수업 여부' })
  isMakeup: boolean;

  @Column({ default: false, comment: '출석 여부' })
  attended: boolean;

  @Column({ default: false, comment: '감상문 제출 여부' })
  report: boolean;

  @Column({ default: false, comment: '주간 레오(과제2) 제출 여부' })
  report2: boolean;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  updatedAt: Date;
}
