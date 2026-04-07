import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransfersController } from './transfers.controller';
import { TransfersService } from './transfers.service';
import { TransferRequest } from './transfer-request.entity';
import { User } from '../users/user.entity';
import { OwnershipRecord } from '../ownership/ownership.entity';
import { OwnershipModule } from '../ownership/ownership.module';

@Module({
  imports: [TypeOrmModule.forFeature([TransferRequest, User, OwnershipRecord]), OwnershipModule],
  controllers: [TransfersController],
  providers: [TransfersService],
})
export class TransfersModule {}
