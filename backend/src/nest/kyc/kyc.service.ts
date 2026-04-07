import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { KycRecord } from './kyc-record.entity';
import { UploadKycDto } from './dto/upload-kyc.dto';
import { VerifyKycDto } from './dto/verify-kyc.dto';
import { VerificationStatus } from './enums/verification-status.enum';
import { User } from '../users/user.entity';
import { KycProviderService } from './providers/kyc-provider.service';

@Injectable()
export class KycService {
  private readonly s3: S3Client;
  private readonly bucket: string;

  constructor(
    @InjectRepository(KycRecord)
    private readonly kycRepository: Repository<KycRecord>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly providerService: KycProviderService,
    configService: ConfigService,
  ) {
    this.bucket = configService.getOrThrow<string>('AWS_S3_BUCKET');
    this.s3 = new S3Client({
      region: configService.getOrThrow<string>('AWS_REGION'),
    });
  }

  async upload(dto: UploadKycDto, file: Express.Multer.File): Promise<KycRecord> {
    const user = await this.usersRepository.findOne({ where: { id: dto.userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const key = `kyc/${dto.userId}/${dto.documentType}/${randomUUID()}-${file.originalname}`;
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    const providerStatus = await this.providerService.runCheck(key, dto.userId);

    const record = await this.kycRepository.save(
      this.kycRepository.create({
        userId: dto.userId,
        documentType: dto.documentType,
        documentUrl: key,
        verificationStatus: providerStatus,
      }),
    );

    if (providerStatus === VerificationStatus.APPROVED) {
      user.kycStatus = true;
      await this.usersRepository.save(user);
    }

    return record;
  }

  async status(userId: string) {
    const records = await this.kycRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    if (records.length === 0) {
      throw new NotFoundException('No KYC records found for user');
    }

    return {
      userId,
      latestStatus: records[0].verificationStatus,
      suspiciousFlag: records.some((record) => record.suspiciousFlag),
      records,
    };
  }

  async verify(dto: VerifyKycDto): Promise<KycRecord> {
    const record = await this.kycRepository.findOne({ where: { id: dto.kycId } });
    if (!record) {
      throw new NotFoundException('KYC record not found');
    }

    record.verificationStatus = dto.verificationStatus;
    record.suspiciousFlag = dto.suspiciousFlag ?? false;
    record.suspiciousReason = dto.suspiciousReason ?? null;

    const saved = await this.kycRepository.save(record);

    const user = await this.usersRepository.findOne({ where: { id: saved.userId } });
    if (user) {
      user.kycStatus = saved.verificationStatus === VerificationStatus.APPROVED;
      await this.usersRepository.save(user);
    }

    return saved;
  }
}
