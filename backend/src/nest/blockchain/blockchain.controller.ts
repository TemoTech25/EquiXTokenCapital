import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { MintBlockchainDto } from './dto/mint-blockchain.dto';
import { TransferBlockchainDto } from './dto/transfer-blockchain.dto';

@Controller('blockchain')
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}

  @Post('mint')
  async mint(@Body() dto: MintBlockchainDto) {
    return this.blockchainService.mint(dto);
  }

  @Post('transfer')
  async transfer(@Body() dto: TransferBlockchainDto) {
    return this.blockchainService.transfer(dto);
  }

  @Get(':asset_id')
  async byAsset(@Param('asset_id', new ParseUUIDPipe()) assetId: string) {
    return this.blockchainService.byAsset(assetId);
  }
}
