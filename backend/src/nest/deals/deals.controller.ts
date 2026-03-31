import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { DealsService } from './deals.service';
import { CreateDealDto } from './dto/create-deal.dto';

@Controller('deals')
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Post()
  async create(@Body() dto: CreateDealDto) {
    return this.dealsService.create(dto);
  }

  @Get(':id')
  async getById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.dealsService.getById(id);
  }
}
