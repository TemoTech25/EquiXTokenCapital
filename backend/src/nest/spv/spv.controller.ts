import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { SpvService } from './spv.service';
import { CreateSpvDto } from './dto/create-spv.dto';
import { AllocateSharesDto } from './dto/allocate-shares.dto';

@Controller('spv')
export class SpvController {
  constructor(private readonly spvService: SpvService) {}

  @Post('create')
  async create(@Body() dto: CreateSpvDto) {
    return this.spvService.create(dto);
  }

  @Get(':id')
  async getById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.spvService.getById(id);
  }

  @Post('allocate-shares')
  async allocateShares(@Body() dto: AllocateSharesDto) {
    return this.spvService.allocateShares(dto);
  }
}
