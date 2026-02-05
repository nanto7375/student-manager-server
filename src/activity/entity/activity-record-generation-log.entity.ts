import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ActivityRecordGenerationLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'char', length: 6, comment: 'YYYYMM' })
  generatedActivityYearMonth: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  createdAt: Date;
}
