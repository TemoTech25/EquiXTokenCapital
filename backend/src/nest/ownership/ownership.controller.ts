import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { OwnershipService } from './ownership.service';
import { CreateOwnershipDto } from './dto/create-ownership.dto';
import { TransferOwnershipDto } from './dto/transfer-ownership.dto';

@Controller('ownership')
export class OwnershipController {
  constructor(private readonly ownershipService: OwnershipService) {}

  @Post()
  async create(@Body() dto: CreateOwnershipDto) {
    return this.ownershipService.createOwnership(dto);
  }

  @Get(':asset_id')
  async getByAsset(@Param('asset_id', new ParseUUIDPipe()) assetId: string) {
    return this.ownershipService.getOwnershipByAsset(assetId);
  }

  @Patch('transfer')
  async transfer(@Body() dto: TransferOwnershipDto) {
    return this.ownershipService.transferOwnership(dto);
  }
}
