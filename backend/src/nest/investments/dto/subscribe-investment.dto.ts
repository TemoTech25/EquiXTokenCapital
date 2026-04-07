import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsUUID, Min } from 'class-validator';

export class SubscribeInvestmentDto {
  @IsUUID()
  spvId!: string;

  @IsUUID()
  investorId!: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amountInvested!: number;

  @IsInt()
  @Min(1)
  sharesRequested!: number;
}
