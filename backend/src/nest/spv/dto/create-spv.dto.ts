import { IsEnum, IsInt, IsString, IsUUID, MaxLength, Min } from 'class-validator';
import { LegalType } from '../enums/legal-type.enum';

export class CreateSpvDto {
  @IsString()
  @MaxLength(200)
  name!: string;

  @IsUUID()
  propertyId!: string;

  @IsEnum(LegalType)
  legalType!: LegalType;

  @IsInt()
  @Min(1)
  totalShares!: number;
}
