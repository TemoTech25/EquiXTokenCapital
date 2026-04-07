import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { TransferStatus } from './enums/transfer-status.enum';

@Entity({ name: 'ownership_transfers' })
export class TransferRequest {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'from_user_id', type: 'uuid' })
  fromUserId!: string;

  @Column({ name: 'to_user_id', type: 'uuid' })
  toUserId!: string;

  @Column({ name: 'asset_id', type: 'uuid' })
  assetId!: string;

  @Column({ type: 'numeric', precision: 7, scale: 4 })
  percentage!: string;

  @Column({ type: 'enum', enum: TransferStatus, default: TransferStatus.PENDING })
  status!: TransferStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'from_user_id' })
  fromUser!: User;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'to_user_id' })
  toUser!: User;
}
