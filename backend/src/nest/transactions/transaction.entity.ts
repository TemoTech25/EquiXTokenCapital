import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Deal } from '../deals/deal.entity';
import { TransactionState } from './enums/transaction-state.enum';
import { Role } from '../common/enums/role.enum';

export interface StateTransitionRecord {
  from: TransactionState | null;
  to: TransactionState;
  timestamp: string;
}

export interface TransactionTask {
  id: string;
  title: string;
  description?: string;
  assignedRole: Role;
  status: 'PENDING' | 'DONE';
  createdAt: string;
}

@Entity({ name: 'transactions' })
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'deal_id', type: 'uuid' })
  dealId!: string;

  @Column({
    name: 'current_state',
    type: 'enum',
    enum: TransactionState,
    default: TransactionState.CREATED,
  })
  currentState!: TransactionState;

  @Column({ name: 'state_history', type: 'jsonb', default: () => "'[]'::jsonb" })
  stateHistory!: StateTransitionRecord[];

  @Column({ name: 'tasks', type: 'jsonb', default: () => "'[]'::jsonb" })
  tasks!: TransactionTask[];

  @ManyToOne(() => Deal, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'deal_id' })
  deal!: Deal;
}
