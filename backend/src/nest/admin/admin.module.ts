import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Deal } from '../deals/deal.entity';
import { Transaction } from '../transactions/transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Deal, Transaction])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
