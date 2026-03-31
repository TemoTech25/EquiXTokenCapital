import { IsEnum, IsOptional } from 'class-validator';
import { TransferStatus } from '../enums/transfer-status.enum';

export class ApproveTransferDto {
  @IsOptional()
  @IsEnum(TransferStatus)
  status?: TransferStatus;
}
