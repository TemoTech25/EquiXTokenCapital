import { IsString, MaxLength, MinLength } from 'class-validator';

export class UploadDocumentDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  type!: string;
}
