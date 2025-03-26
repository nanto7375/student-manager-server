import { ClassSchedule } from '@src/schedule/entity/class-schedule.entity';
import { TuitionPayment } from '@src/tuition-payment/entity/tuition-payment.entity';
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  tuition: number;

  @Column({ nullable: true })
  gender: string;

  @Column()
  birthYear: number;

  @Column({ nullable: true })
  birthDate: Date;

  @Column({ nullable: true })
  phone: string;

  @Column()
  parentPhone: string;

  @Column()
  schoolName: string;

  @Column()
  classScheduleId: number;

  @ManyToOne(() => ClassSchedule, (classSchedule) => classSchedule.id)
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
