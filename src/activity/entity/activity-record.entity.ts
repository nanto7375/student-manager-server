import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Student } from '@src/student/entity/student.entity';

@Entity()
export class ActivityRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  studentId: number;

  @ManyToOne(() => Student, (student) => student.id, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  student: Student;

  @Column({ type: 'char', length: 8, comment: 'YYYYMMDD' })
  @Index()
  date: string;

  @Column({ default: false, comment: '대체 수업 여부' })
  isMakeup: boolean;

  @Column({ default: false, comment: '출석 여부' })
  attended: boolean;

  @Column({ default: false, comment: '감상문 제출 여부' })
  report1: boolean;

  @Column({ default: false, comment: '주간 레오(과제2) 제출 여부' })
  report2: boolean;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  updatedAt: Date;
}
