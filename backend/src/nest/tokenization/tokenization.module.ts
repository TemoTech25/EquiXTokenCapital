import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenizationController } from './tokenization.controller';
import { TokenizationService } from './tokenization.service';
import { OffchainToken } from './token.entity';
import { OwnershipRecord } from '../ownership/ownership.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OffchainToken, OwnershipRecord])],
  controllers: [TokenizationController],
  providers: [TokenizationService],
})
export class TokenizationModule {}
