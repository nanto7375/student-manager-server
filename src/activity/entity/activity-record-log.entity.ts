import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ActivityRecord } from './activity-record.entity';
import { Admin } from '@src/admin/entity/admin.entity';

@Entity()
export class ActivityRecordLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  activityRecordId: number;

  @ManyToOne(() => ActivityRecord, (activityRecord) => activityRecord.id, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' })
  activityRecord: ActivityRecord;

  @Column()
  adminId: number;

  @ManyToOne(() => Admin, (admin) => admin.id, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' })
  admin: Admin;

  @Column()
  key: string;

  @Column()
  value: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  createdAt: Date;
}
