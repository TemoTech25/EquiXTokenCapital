import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Deal } from '../deals/deal.entity';
import { User } from '../users/user.entity';
import { PaymentCurrency } from './enums/payment-currency.enum';
import { PaymentStatus } from './enums/payment-status.enum';
import { PaymentMethod } from './enums/payment-method.enum';
import { PaymentAuditLog } from './payment-audit-log.entity';

@Entity({ name: 'payments' })
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'deal_id', type: 'uuid' })
  dealId!: string;

  @Column({ name: 'payer_id', type: 'uuid' })
  payerId!: string;

  @Column({ type: 'numeric', precision: 16, scale: 2 })
  amount!: string;

  @Column({ type: 'enum', enum: PaymentCurrency })
  currency!: PaymentCurrency;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status!: PaymentStatus;

  @Column({ name: 'payment_method', type: 'enum', enum: PaymentMethod })
  paymentMethod!: PaymentMethod;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @ManyToOne(() => Deal, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'deal_id' })
  deal!: Deal;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'payer_id' })
  payer!: User;

  @OneToMany(() => PaymentAuditLog, (log) => log.payment)
  auditLogs!: PaymentAuditLog[];
}
