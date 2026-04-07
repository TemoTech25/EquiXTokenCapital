import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Spv } from './spv.entity';
import { User } from '../users/user.entity';

@Entity({ name: 'spv_share_allocations' })
export class SpvShareAllocation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'spv_id', type: 'uuid' })
  spvId!: string;

  @Column({ name: 'owner_id', type: 'uuid' })
  ownerId!: string;

  @Column({ type: 'integer' })
  shares!: number;

  @ManyToOne(() => Spv, (spv) => spv.allocations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'spv_id' })
  spv!: Spv;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'owner_id' })
  owner!: User;
}
