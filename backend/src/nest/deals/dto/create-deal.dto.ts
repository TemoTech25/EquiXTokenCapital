import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { DealStatus } from '../enums/deal-status.enum';

export class CreateDealDto {
  @IsUUID()
  propertyId!: string;

  @IsUUID()
  buyerId!: string;

  @IsUUID()
  sellerId!: string;

  @IsUUID()
  agentId!: string;

  @IsUUID()
  conveyancerId!: string;

  @IsOptional()
  @IsEnum(DealStatus)
  status?: DealStatus;
}
