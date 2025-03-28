import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ClassSchedule } from '@src/schedule/entity/class-schedule.entity';
import { TuitionPayment } from '@src/tuition-payment/entity/tuition-payment.entity';

@Entity()
export class Student {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 30 })
  name: string;

  @Column({ type: 'char', length: 4, comment: 'YYYY' })
  birthYear: string;

  @Column({ type: 'char', length: 4, nullable: true, comment: 'MMDD' })
  birthDate: string;

  @Column({ type: 'varchar', length: 20, nullable: true, comment: 'MALE,FEMALE' })
  gender: string;

  @Column({ type: 'int', unsigned: true, nullable: true })
  tuition: number;

  @Column({ type: 'varchar', length: 14, nullable: true, comment: '010-1234-5678' })
  phone: string;

  @Column({ type: 'varchar', length: 14, nullable: true, comment: '010-1234-5678' })
  parentPhone: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  schoolName: string;

  @Column({ type: 'varchar', length: 10, nullable: true, comment: '초등학교,중학교,고등학교' })
  schoolLevel: string;

  @Column({ type: 'int', unsigned: true, nullable: true })
  classScheduleId: number;

  @ManyToOne(() => ClassSchedule, (classSchedule) => classSchedule.id, { nullable: true })
  classSchedule: ClassSchedule;

  @OneToMany(() => TuitionPayment, (tuitionPayment) => tuitionPayment.student)
  tuitionPayments: TuitionPayment[];

  @Column({ type: 'timestamp', precision: 6, nullable: true, comment: '등록일' })
  registeredAt: Date;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt: Date;
}
