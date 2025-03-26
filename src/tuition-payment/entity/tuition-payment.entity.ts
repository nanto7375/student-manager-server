import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Student } from '@src/student/entity/student.entity';
import { Month } from '@src/common/constant/date.const';

@Entity()
export class TuitionPayment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  studentId: number;

  @ManyToOne(() => Student, (student) => student.id)
  student: Student;

  @Column({ type: 'char', length: 4, comment: 'YYYY' })
  year: string;

  @Column({ type: 'char', length: 2, comment: 'MM' })
  month: string;

  @Column({ type: 'int', unsigned: true })
  amount: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  payedAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  updatedAt: Date;

  static of(tuitionPaymentDto: TuitionPaymentOf) {
    const tuitionPayment = new TuitionPayment();
    tuitionPayment.student = tuitionPaymentDto.student;
    tuitionPayment.year = tuitionPaymentDto.year;
    tuitionPayment.month = tuitionPaymentDto.month;
    tuitionPayment.amount = tuitionPaymentDto.amount;
    return tuitionPayment;
  }
}

type TuitionPaymentOf = {
  student: Student;
  year: string;
  month: Month;
  amount: number;
};
