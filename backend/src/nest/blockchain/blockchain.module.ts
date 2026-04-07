import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockchainController } from './blockchain.controller';
import { BlockchainService } from './blockchain.service';
import { BlockchainTokenRecord } from './blockchain-token.entity';
import { OffchainToken } from '../tokenization/token.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BlockchainTokenRecord, OffchainToken])],
  controllers: [BlockchainController],
  providers: [BlockchainService],
})
export class BlockchainModule {}
