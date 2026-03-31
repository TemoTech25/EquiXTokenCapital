import { Body, Controller, Post } from '@nestjs/common';
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
}
