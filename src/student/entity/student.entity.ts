import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ClassSchedule } from '@src/schedule/entity/class-schedule.entity';
import { TuitionPayment } from '@src/tuition-payment/entity/tuition-payment.entity';

@Entity()
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'char', length: 4, comment: 'YYYY' })
  birthYear: string;

  @Column({ type: 'char', length: 4, comment: 'MMDD' })
  birthDate: string;

  @Column({ type: 'char', length: 1, comment: 'M,F', nullable: true })
  gender: string;

  @Column({ type: 'int', unsigned: true, nullable: true })
  tuition: number;

  @Column({ type: 'varchar', length: 12, nullable: true, comment: '01012345678' })
  phone: string;

  @Column({ type: 'varchar', length: 12, nullable: true, comment: '01012345678' })
  parentPhone: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  schoolName: string;

  @Column({ type: 'char', length: 1, nullable: true, comment: '초,중,고' })
  schoolLevel: string;

  @Column({ nullable: true })
  classScheduleId: number;

  @ManyToOne(() => ClassSchedule, (classSchedule) => classSchedule.id, { nullable: true })
  classSchedule: ClassSchedule;

  @OneToMany(() => TuitionPayment, (tuitionPayment) => tuitionPayment.student)
  tuitionPayments: TuitionPayment[];

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt: Date;
}
