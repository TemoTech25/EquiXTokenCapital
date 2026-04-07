import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { TransfersService } from './transfers.service';
import { RequestTransferDto } from './dto/request-transfer.dto';
import { ApproveTransferDto } from './dto/approve-transfer.dto';

@Controller('transfers')
export class TransfersController {
  constructor(private readonly transfersService: TransfersService) {}

  @Post('request')
  async request(@Body() dto: RequestTransferDto) {
    return this.transfersService.request(dto);
  }

  @Patch(':id/approve')
  async approve(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: ApproveTransferDto,
  ) {
    return this.transfersService.approve(id, dto);
  }

  @Get(':user_id')
  async list(@Param('user_id', new ParseUUIDPipe()) userId: string) {
    return this.transfersService.listByUser(userId);
  }
}
