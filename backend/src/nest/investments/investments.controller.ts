import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { InvestmentsService } from './investments.service';
import { SubscribeInvestmentDto } from './dto/subscribe-investment.dto';

@Controller('investments')
export class InvestmentsController {
  constructor(private readonly investmentsService: InvestmentsService) {}

  @Post('subscribe')
  async subscribe(@Body() dto: SubscribeInvestmentDto) {
    return this.investmentsService.subscribe(dto);
  }

  @Get('opportunities')
  async opportunities() {
    return this.investmentsService.opportunities();
  }

  @Get(':user_id')
  async getByUser(@Param('user_id', new ParseUUIDPipe()) userId: string) {
    return this.investmentsService.getByUser(userId);
  }
}
