import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { Deal } from '../deals/deal.entity';
import { Transaction } from '../transactions/transaction.entity';
import { KycRecord } from '../kyc/kyc-record.entity';
import { Payment } from '../payments/payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Deal, Transaction, KycRecord, Payment])],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
