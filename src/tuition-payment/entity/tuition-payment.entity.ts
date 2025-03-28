import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Student } from '@src/student/entity/student.entity';
import { Month } from '@src/common/constant/date.const';

@Entity()
export class TuitionPayment {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true })
  studentId: number;

  @ManyToOne(() => Student, (student) => student.id)
  student: Student;

  @Column({ type: 'char', length: 4, comment: 'YYYY' })
  year: string;

  @Column({ type: 'char', length: 2, comment: 'MM' })
  month: string;

  @Column({ type: 'int', unsigned: true })
  feeAmount: number;

  @Column({ type: 'timestamp', precision: 6, nullable: true, comment: '결제일' })
  payedAt: Date;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  updatedAt: Date;

  static of(tuitionPaymentDto: TuitionPaymentOf) {
    const tuitionPayment = new TuitionPayment();
    tuitionPayment.student = tuitionPaymentDto.student;
    tuitionPayment.year = tuitionPaymentDto.year;
    tuitionPayment.month = tuitionPaymentDto.month;
    tuitionPayment.feeAmount = tuitionPaymentDto.feeAmount;
    return tuitionPayment;
  }
}

type TuitionPaymentOf = {
  student: Student;
  year: string;
  month: Month;
  feeAmount: number;
};
