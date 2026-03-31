import { IsBoolean, IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { VerificationStatus } from '../enums/verification-status.enum';

export class VerifyKycDto {
  @IsUUID()
  kycId!: string;

  @IsEnum(VerificationStatus)
  verificationStatus!: VerificationStatus;

  @IsOptional()
  @IsBoolean()
  suspiciousFlag?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  suspiciousReason?: string;
}
