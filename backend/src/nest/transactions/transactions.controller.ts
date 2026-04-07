import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { UpdateTransactionStateDto } from './dto/update-transaction-state.dto';
import { CreateTransactionTaskDto } from './dto/create-transaction-task.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Patch(':id/state')
  async updateState(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateTransactionStateDto,
  ) {
    return this.transactionsService.updateState(id, dto);
  }

  @Get(':id')
  async getById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.transactionsService.getById(id);
  }

  @Post(':id/tasks')
  async addTask(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: CreateTransactionTaskDto,
  ) {
    return this.transactionsService.addTask(id, dto);
  }
}
