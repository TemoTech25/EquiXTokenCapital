import { Body, Controller, Get, Param, ParseUUIDPipe, Patch } from '@nestjs/common';
import { AdminService } from './admin.service';
import { OverrideTransactionStateDto } from './dto/override-transaction-state.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('deals')
  async deals() {
    return this.adminService.getDeals();
  }

  @Get('transactions')
  async transactions() {
    return this.adminService.getTransactions();
  }

  @Patch('transactions/:id/override')
  async override(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: OverrideTransactionStateDto,
  ) {
    return this.adminService.overrideTransactionState(id, dto);
  }
}
