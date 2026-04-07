import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { TokenizationService } from './tokenization.service';
import { MintTokenDto } from './dto/mint-token.dto';
import { TransferTokenDto } from './dto/transfer-token.dto';

@Controller('tokens')
export class TokenizationController {
  constructor(private readonly tokenizationService: TokenizationService) {}

  @Post('mint')
  async mint(@Body() dto: MintTokenDto) {
    return this.tokenizationService.mint(dto);
  }

  @Post('transfer')
  async transfer(@Body() dto: TransferTokenDto) {
    return this.tokenizationService.transfer(dto);
  }

  @Get(':asset_id')
  async byAsset(@Param('asset_id', new ParseUUIDPipe()) assetId: string) {
    return this.tokenizationService.byAsset(assetId);
  }
}
