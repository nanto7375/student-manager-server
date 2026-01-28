import { Schedule } from '@src/schedule/entity/schedule.entity';
import { Column, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Student {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 30 })
  name: string;

  @Column({ type: 'char', length: 4, nullable: true, comment: 'YYYY' })
  birthYear: string;

  @Column({ type: 'char', length: 4, nullable: true, comment: 'MMDD' })
  birthDate: string;

  @Column({ type: 'int', unsigned: true, nullable: true, comment: '1: 초등학교, 2: 중학교, 3: 고등학교' })
  schoolLevel: number;

  @Column({ type: 'int', unsigned: true, nullable: true, comment: '1, 2, 3, 4, 5, 6' })
  schoolGrade: number;

  @Column({ type: 'varchar', length: 30, nullable: true })
  schoolName: string;

  @Column({ nullable: true, comment: '비고' })
  note: string;

  @Column({ type: 'int', unsigned: true, nullable: true })
  scheduleId: number;

  @ManyToOne(() => Schedule, (schedule) => schedule.id, { onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  schedule: Schedule;

  @Column({ type: 'varchar', length: 20, nullable: true, comment: '010-1234-5678' })
  phone: string;

  @Column({ type: 'varchar', length: 20, nullable: true, comment: '010-1234-5678' })
  parentPhone: string;

  @Column({ type: 'timestamp', precision: 6, nullable: true, comment: '등록일' })
  registeredAt: Date;

  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt: Date;
}
