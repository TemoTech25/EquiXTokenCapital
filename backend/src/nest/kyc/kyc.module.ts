import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KycController } from './kyc.controller';
import { KycService } from './kyc.service';
import { KycRecord } from './kyc-record.entity';
import { User } from '../users/user.entity';
import { KycProviderService } from './providers/kyc-provider.service';

@Module({
  imports: [TypeOrmModule.forFeature([KycRecord, User])],
  controllers: [KycController],
  providers: [KycService, KycProviderService],
})
export class KycModule {}
