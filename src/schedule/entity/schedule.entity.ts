import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Lesson } from './lesson.entity';
import { Student } from '@src/student/entity/student.entity';

@Entity()
export class Schedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', unsigned: true, comment: '1: 월, 2: 화, 3: 수, 4: 목, 5: 금, 6: 토, 7: 일' })
  dayOfWeek: number;

  @Column({ type: 'char', length: 4, comment: 'HHMM' })
  startTime: string;

  @Column({ type: 'char', length: 4, comment: 'HHMM' })
  endTime: string;

  @Column({ nullable: true })
  lessonId: number;

  @ManyToOne(() => Lesson, (lesson) => lesson.id, { onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  lesson: Lesson;

  @OneToMany(() => Student, (student) => student.schedule)
  students: Student[];

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt: Date;
}
