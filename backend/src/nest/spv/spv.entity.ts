import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Property } from '../properties/property.entity';
import { LegalType } from './enums/legal-type.enum';
import { SpvShareAllocation } from './spv-share-allocation.entity';

@Entity({ name: 'spvs' })
export class Spv {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({ name: 'property_id', type: 'uuid' })
  propertyId!: string;

  @Column({ name: 'legal_type', type: 'enum', enum: LegalType })
  legalType!: LegalType;

  @Column({ name: 'total_shares', type: 'integer' })
  totalShares!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @ManyToOne(() => Property, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'property_id' })
  property!: Property;

  @OneToMany(() => SpvShareAllocation, (allocation) => allocation.spv)
  allocations!: SpvShareAllocation[];
}
