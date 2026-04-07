import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Payment } from './payment.entity';

@Entity({ name: 'payment_audit_logs' })
export class PaymentAuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'payment_id', type: 'uuid' })
  paymentId!: string;

  @Column({ type: 'varchar', length: 120 })
  action!: string;

  @Column({ name: 'meta_json', type: 'jsonb', default: () => "'{}'::jsonb" })
  metaJson!: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @ManyToOne(() => Payment, (payment) => payment.auditLogs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'payment_id' })
  payment!: Payment;
}
