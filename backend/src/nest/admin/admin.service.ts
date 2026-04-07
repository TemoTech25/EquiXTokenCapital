import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Deal } from '../deals/deal.entity';
import { Transaction } from '../transactions/transaction.entity';
import { OverrideTransactionStateDto } from './dto/override-transaction-state.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Deal)
    private readonly dealsRepository: Repository<Deal>,
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
  ) {}

  async getDeals() {
    return this.dealsRepository.find({
      relations: {
        property: true,
        buyer: true,
        seller: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async getTransactions() {
    return this.transactionsRepository.find({
      order: { id: 'DESC' },
    });
  }

  async overrideTransactionState(id: string, dto: OverrideTransactionStateDto) {
    const transaction = await this.transactionsRepository.findOne({ where: { id } });
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    const previous = transaction.currentState;
    transaction.currentState = dto.state;
    transaction.stateHistory = [
      ...(transaction.stateHistory ?? []),
      {
        from: previous,
        to: dto.state,
        timestamp: new Date().toISOString(),
      },
    ];

    return this.transactionsRepository.save(transaction);
  }
}
