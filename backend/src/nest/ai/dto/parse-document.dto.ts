import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class ParseDocumentDto {
  @IsString()
  @MinLength(10)
  @MaxLength(20000)
  text!: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  documentType?: string;
}
