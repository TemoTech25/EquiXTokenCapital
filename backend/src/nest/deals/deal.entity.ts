import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Property } from '../properties/property.entity';
import { DealStatus } from './enums/deal-status.enum';

@Entity({ name: 'deals' })
export class Deal {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'property_id', type: 'uuid' })
  propertyId!: string;

  @Column({ name: 'buyer_id', type: 'uuid' })
  buyerId!: string;

  @Column({ name: 'seller_id', type: 'uuid' })
  sellerId!: string;

  @Column({ name: 'agent_id', type: 'uuid' })
  agentId!: string;

  @Column({ name: 'conveyancer_id', type: 'uuid' })
  conveyancerId!: string;

  @Column({ type: 'enum', enum: DealStatus, default: DealStatus.DRAFT })
  status!: DealStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @ManyToOne(() => Property, (property: Property) => property.deals, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'property_id' })
  property!: Property;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'buyer_id' })
  buyer!: User;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'seller_id' })
  seller!: User;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'agent_id' })
  agent!: User;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'conveyancer_id' })
  conveyancer!: User;
}
