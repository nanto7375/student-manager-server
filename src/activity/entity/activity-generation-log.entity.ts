import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ActivityGenerationLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'char', length: 6, comment: 'YYYYMM' })
  generatedActivityMonth: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  createdAt: Date;
}
