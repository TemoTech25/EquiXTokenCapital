import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class MintBlockchainDto {
  @IsUUID()
  assetId!: string;

  @IsUUID()
  ownerId!: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0.0001)
  amount!: number;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  type?: string;
}
