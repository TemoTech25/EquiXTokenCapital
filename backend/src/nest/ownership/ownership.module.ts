import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OwnershipController } from './ownership.controller';
import { OwnershipService } from './ownership.service';
import { OwnershipRecord } from './ownership.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OwnershipRecord])],
  controllers: [OwnershipController],
  providers: [OwnershipService],
  exports: [OwnershipService],
})
export class OwnershipModule {}
