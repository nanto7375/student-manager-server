import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class DiscardedToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  token: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  static of({ token, createdAt }: DiscardedTokenOf) {
    const discardedToken = new DiscardedToken();
    discardedToken.token = token;
    discardedToken.createdAt = createdAt;
    return discardedToken;
  }
}

type DiscardedTokenOf = {
  token: string;
  createdAt: Date;
};
