import { IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class AllocateSharesDto {
  @IsUUID()
  spvId!: string;

  @IsUUID()
  ownerId!: string;

  @IsInt()
  @Min(1)
  shares!: number;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  rightsType?: string;
}
