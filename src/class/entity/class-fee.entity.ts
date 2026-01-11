import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ClassFee {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;
}
