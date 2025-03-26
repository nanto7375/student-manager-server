import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Student } from '@src/student/entity/student.entity';

@Entity()
export class TuitionPayment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  studentId: number;

  @ManyToOne(() => Student, (student) => student.id)
  student: Student;

  @Column()
  year: number;

  @Column()
  month: number;

  @Column()
  amount: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  payedAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  updatedAt: Date;
}
