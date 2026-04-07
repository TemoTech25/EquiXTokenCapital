import { IsEnum, IsUUID } from 'class-validator';
import { DocumentType } from '../enums/document-type.enum';

export class UploadKycDto {
  @IsUUID()
  userId!: string;

  @IsEnum(DocumentType)
  documentType!: DocumentType;
}
