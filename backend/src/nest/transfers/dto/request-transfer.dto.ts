import { Type } from 'class-transformer';
import { IsNumber, IsUUID, Min } from 'class-validator';

export class RequestTransferDto {
  @IsUUID()
  fromUserId!: string;

  @IsUUID()
  toUserId!: string;

  @IsUUID()
  assetId!: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0.0001)
  percentage!: number;
}
