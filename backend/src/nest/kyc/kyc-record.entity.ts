import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { DocumentType } from './enums/document-type.enum';
import { VerificationStatus } from './enums/verification-status.enum';

@Entity({ name: 'kyc_records' })
export class KycRecord {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'document_type', type: 'enum', enum: DocumentType })
  documentType!: DocumentType;

  @Column({ name: 'document_url', type: 'text' })
  documentUrl!: string;

  @Column({
    name: 'verification_status',
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.PENDING,
  })
  verificationStatus!: VerificationStatus;

  @Column({ name: 'suspicious_flag', type: 'boolean', default: false })
  suspiciousFlag!: boolean;

  @Column({ name: 'suspicious_reason', type: 'text', nullable: true })
  suspiciousReason?: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
