import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { User } from './users/user.entity';
import { Property } from './properties/property.entity';
import { Deal } from './deals/deal.entity';
import { PropertiesModule } from './properties/properties.module';
import { DealsModule } from './deals/deals.module';
import { TransactionsModule } from './transactions/transactions.module';
import { Transaction } from './transactions/transaction.entity';
import { ManagedDocument } from './documents/document.entity';
import { DocumentsModule } from './documents/documents.module';
import { OwnershipModule } from './ownership/ownership.module';
import { OwnershipRecord } from './ownership/ownership.entity';
import { TokenizationModule } from './tokenization/tokenization.module';
import { OffchainToken } from './tokenization/token.entity';
import { NotificationsModule } from './notifications/notifications.module';
import { Notification } from './notifications/notification.entity';
import { PaymentsModule } from './payments/payments.module';
import { Payment } from './payments/payment.entity';
import { PaymentAuditLog } from './payments/payment-audit-log.entity';
import { KycModule } from './kyc/kyc.module';
import { KycRecord } from './kyc/kyc-record.entity';
import { SpvModule } from './spv/spv.module';
import { Spv } from './spv/spv.entity';
import { SpvShareAllocation } from './spv/spv-share-allocation.entity';
import { InvestmentsModule } from './investments/investments.module';
import { Investment } from './investments/investment.entity';
import { TransfersModule } from './transfers/transfers.module';
import { TransferRequest } from './transfers/transfer-request.entity';
import { AnalyticsModule } from './analytics/analytics.module';
import { AiModule } from './ai/ai.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { BlockchainTokenRecord } from './blockchain/blockchain-token.entity';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.getOrThrow<string>('DATABASE_URL'),
        entities: [User, Property, Deal, Transaction, ManagedDocument, OwnershipRecord, OffchainToken, Notification, Payment, PaymentAuditLog, KycRecord, Spv, SpvShareAllocation, Investment, TransferRequest, BlockchainTokenRecord],
        synchronize: false,
      }),
    }),
    AuthModule,
    UsersModule,
    PropertiesModule,
    DealsModule,
    NotificationsModule,
    PaymentsModule,
    TransactionsModule,
    DocumentsModule,
    OwnershipModule,
    TokenizationModule,
    KycModule,
    SpvModule,
    InvestmentsModule,
    TransfersModule,
    AnalyticsModule,
    AiModule,
    BlockchainModule,
    AdminModule,
  ],
})
export class AppModule {}
