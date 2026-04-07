import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class TransferTokenDto {
  @IsUUID()
  assetId!: string;

  @IsUUID()
  fromOwnerId!: string;

  @IsUUID()
  toOwnerId!: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0.0001)
  amount!: number;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  type?: string;
}
