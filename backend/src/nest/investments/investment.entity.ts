import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Spv } from '../spv/spv.entity';
import { User } from '../users/user.entity';
import { InvestmentStatus } from './enums/investment-status.enum';

@Entity({ name: 'investments' })
export class Investment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'spv_id', type: 'uuid' })
  spvId!: string;

  @Column({ name: 'investor_id', type: 'uuid' })
  investorId!: string;

  @Column({ name: 'amount_invested', type: 'numeric', precision: 16, scale: 2 })
  amountInvested!: string;

  @Column({ name: 'shares_allocated', type: 'integer' })
  sharesAllocated!: number;

  @Column({ type: 'enum', enum: InvestmentStatus, default: InvestmentStatus.PENDING })
  status!: InvestmentStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @ManyToOne(() => Spv, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'spv_id' })
  spv!: Spv;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'investor_id' })
  investor!: User;
}
