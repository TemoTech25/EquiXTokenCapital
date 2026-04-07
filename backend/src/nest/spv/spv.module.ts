import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpvController } from './spv.controller';
import { SpvService } from './spv.service';
import { Spv } from './spv.entity';
import { SpvShareAllocation } from './spv-share-allocation.entity';
import { Property } from '../properties/property.entity';
import { OwnershipRecord } from '../ownership/ownership.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Spv, SpvShareAllocation, Property, OwnershipRecord])],
  controllers: [SpvController],
  providers: [SpvService],
  exports: [SpvService],
})
export class SpvModule {}
