import {
  IsArray,
  IsNumber,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class OwnershipSplitDto {
  @IsUUID()
  ownerId!: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 4 })
  @IsPositive()
  @Min(0.0001)
  percentage!: number;

  @IsString()
  @MaxLength(80)
  rightsType!: string;
}

export class CreateOwnershipDto {
  @IsUUID()
  assetId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OwnershipSplitDto)
  splits!: OwnershipSplitDto[];
}

export { OwnershipSplitDto };
