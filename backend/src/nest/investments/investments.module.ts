import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvestmentsController } from './investments.controller';
import { InvestmentsService } from './investments.service';
import { Investment } from './investment.entity';
import { Spv } from '../spv/spv.entity';
import { SpvShareAllocation } from '../spv/spv-share-allocation.entity';
import { SpvModule } from '../spv/spv.module';

@Module({
  imports: [TypeOrmModule.forFeature([Investment, Spv, SpvShareAllocation]), SpvModule],
  controllers: [InvestmentsController],
  providers: [InvestmentsService],
})
export class InvestmentsModule {}
