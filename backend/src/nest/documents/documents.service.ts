import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { ManagedDocument } from './document.entity';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { Role } from '../common/enums/role.enum';

interface AuthUser {
  sub: string;
  role: Role;
}

@Injectable()
export class DocumentsService {
  private readonly bucket: string;
  private readonly s3: S3Client;

  constructor(
    @InjectRepository(ManagedDocument)
    private readonly documentsRepository: Repository<ManagedDocument>,
    private readonly configService: ConfigService,
  ) {
    this.bucket = this.configService.getOrThrow<string>('AWS_S3_BUCKET');
    this.s3 = new S3Client({
      region: this.configService.getOrThrow<string>('AWS_REGION'),
    });
  }

  async uploadDocument(dto: UploadDocumentDto, file: Express.Multer.File, user: AuthUser) {
    if (!file) {
      throw new NotFoundException('File payload is required');
    }

    const latest = await this.documentsRepository.findOne({
      where: { ownerId: user.sub, type: dto.type },
      order: { version: 'DESC' },
    });

    const nextVersion = (latest?.version ?? 0) + 1;
    const key = `${user.sub}/${dto.type}/v${nextVersion}-${randomUUID()}-${file.originalname}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    const document = this.documentsRepository.create({
      type: dto.type,
      ownerId: user.sub,
      fileUrl: key,
      version: nextVersion,
    });

    const saved = await this.documentsRepository.save(document);
    const signedUrl = await this.buildSignedUrl(saved.fileUrl);

    return {
      ...saved,
      signedUrl,
    };
  }

  async getDocumentById(id: string, user: AuthUser) {
    const document = await this.documentsRepository.findOne({ where: { id } });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (!this.hasAccess(document.ownerId, user)) {
      throw new ForbiddenException('You do not have access to this document');
    }

    return {
      ...document,
      signedUrl: await this.buildSignedUrl(document.fileUrl),
    };
  }

  private hasAccess(ownerId: string, user: AuthUser): boolean {
    if (ownerId === user.sub) {
      return true;
    }

    return [Role.ADMIN, Role.CONVEYANCER, Role.AGENT].includes(user.role);
  }

  private async buildSignedUrl(key: string): Promise<string> {
    return getSignedUrl(
      this.s3,
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
      { expiresIn: 60 * 10 },
    );
  }
}
