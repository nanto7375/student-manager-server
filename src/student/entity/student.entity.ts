import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ClassSchedule } from '@src/schedule/entity/class-schedule.entity';
import { TuitionPayment } from '@src/tuition-payment/entity/tuition-payment.entity';

@Entity()
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  birthYear: number;

  @Column({ nullable: true, comment: 'MMDD' })
  birthDate: Date;

  @Column({ nullable: true })
  gender: string;

  @Column({ nullable: true })
  tuition: number;

  @Column({ nullable: true, comment: '01012345678' })
  phone: string;

  @Column({ nullable: true, comment: '01012345678' })
  parentPhone: string;

  @Column({ nullable: true, comment: 'XX초, OO중, **고' })
  schoolName: string;

  @Column({ nullable: true })
  classScheduleId: number;

  @ManyToOne(() => ClassSchedule, (classSchedule) => classSchedule.id, { nullable: true })
  classSchedule: ClassSchedule;

  @OneToMany(() => TuitionPayment, (tuitionPayment) => tuitionPayment.student)
  tuitionPayments: TuitionPayment[];

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  registeredAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt: Date;
}
