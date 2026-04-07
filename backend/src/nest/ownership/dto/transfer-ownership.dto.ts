import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class TransferOwnershipDto {
  @IsUUID()
  assetId!: string;

  @IsUUID()
  fromOwnerId!: string;

  @IsUUID()
  toOwnerId!: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0.0001)
  percentage!: number;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  rightsType?: string;
}
