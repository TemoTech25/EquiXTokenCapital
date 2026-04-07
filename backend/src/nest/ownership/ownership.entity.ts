import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../users/user.entity';

export interface OwnershipHistoryEntry {
  action: 'CREATED' | 'TRANSFER_IN' | 'TRANSFER_OUT';
  percentage: string;
  counterpartyOwnerId?: string;
  timestamp: string;
  note?: string;
}

@Entity({ name: 'ownership_records' })
export class OwnershipRecord {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'asset_id', type: 'uuid' })
  assetId!: string;

  @Column({ name: 'owner_id', type: 'uuid' })
  ownerId!: string;

  @Column({ type: 'numeric', precision: 7, scale: 4 })
  percentage!: string;

  @Column({ name: 'rights_type', type: 'varchar', length: 80 })
  rightsType!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @Column({ name: 'history_log', type: 'jsonb', default: () => "'[]'::jsonb" })
  historyLog!: OwnershipHistoryEntry[];

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'owner_id' })
  owner!: User;
}
