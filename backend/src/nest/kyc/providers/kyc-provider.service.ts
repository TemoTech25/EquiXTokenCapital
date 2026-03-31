import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { VerificationStatus } from '../enums/verification-status.enum';

@Injectable()
export class KycProviderService {
  constructor(private readonly configService: ConfigService) {}

  async runCheck(documentUrl: string, userId: string): Promise<VerificationStatus> {
    const endpoint = this.configService.get<string>('SMILE_IDENTITY_ENDPOINT');
    const apiKey = this.configService.get<string>('SMILE_IDENTITY_API_KEY');

    if (!endpoint || !apiKey) {
      return VerificationStatus.PENDING;
    }

    try {
      const response = await axios.post(
        endpoint,
        { userId, documentUrl },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
          timeout: 10000,
        },
      );

      const result = String(response.data?.status ?? 'PENDING').toUpperCase();
      if (result === VerificationStatus.APPROVED) {
        return VerificationStatus.APPROVED;
      }
      if (result === VerificationStatus.REJECTED) {
        return VerificationStatus.REJECTED;
      }
      return VerificationStatus.PENDING;
    } catch {
      return VerificationStatus.PENDING;
    }
  }
}
