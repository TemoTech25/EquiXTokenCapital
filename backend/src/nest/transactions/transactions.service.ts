import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { Transaction, TransactionTask } from './transaction.entity';
import { TransactionState } from './enums/transaction-state.enum';
import { UpdateTransactionStateDto } from './dto/update-transaction-state.dto';
import { CreateTransactionTaskDto } from './dto/create-transaction-task.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { Role } from '../common/enums/role.enum';
import { PaymentsService } from '../payments/payments.service';

const VALID_TRANSITIONS: Record<TransactionState, TransactionState[]> = {
  [TransactionState.CREATED]: [TransactionState.OFFER_MADE],
  [TransactionState.OFFER_MADE]: [TransactionState.OFFER_ACCEPTED],
  [TransactionState.OFFER_ACCEPTED]: [TransactionState.DOCUMENTS_PENDING],
  [TransactionState.DOCUMENTS_PENDING]: [TransactionState.COMPLIANCE_CHECK],
  [TransactionState.COMPLIANCE_CHECK]: [TransactionState.TRANSFER_INITIATED],
  [TransactionState.TRANSFER_INITIATED]: [TransactionState.TRANSFER_COMPLETED],
  [TransactionState.TRANSFER_COMPLETED]: [],
};

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
    private readonly notificationsService: NotificationsService,
    private readonly paymentsService: PaymentsService,
  ) {}

  async getById(id: string): Promise<Transaction> {
    const transaction = await this.transactionsRepository.findOne({
      where: { id },
      relations: {
        deal: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  async updateState(id: string, dto: UpdateTransactionStateDto): Promise<Transaction> {
    const transaction = await this.getById(id);

    const currentState = transaction.currentState;
    const nextState = dto.state;

    if (currentState === nextState) {
      throw new BadRequestException('State is already set to the requested value');
    }

    const allowedStates = VALID_TRANSITIONS[currentState] ?? [];
    if (!allowedStates.includes(nextState)) {
      throw new BadRequestException(`Invalid transition from ${currentState} to ${nextState}`);
    }

    transaction.currentState = nextState;
    transaction.stateHistory = [
      ...(transaction.stateHistory ?? []),
      {
        from: currentState,
        to: nextState,
        timestamp: new Date().toISOString(),
      },
    ];

    const updated = await this.transactionsRepository.save(transaction);
    if (nextState === TransactionState.TRANSFER_COMPLETED) {
      await this.paymentsService.releaseHeldPaymentsForDeal(transaction.dealId);
    }

    const recipients = [
      transaction.deal.buyerId,
      transaction.deal.sellerId,
      transaction.deal.agentId,
      transaction.deal.conveyancerId,
    ];

    await Promise.all(
      recipients.map((userId) =>
        this.notificationsService.createNotification(
          userId,
          `Transaction ${transaction.id} moved to ${nextState}.`,
        ),
      ),
    );

    return updated;
  }

  async addTask(id: string, dto: CreateTransactionTaskDto): Promise<Transaction> {
    const transaction = await this.getById(id);

    const newTask: TransactionTask = {
      id: randomUUID(),
      title: dto.title,
      description: dto.description,
      assignedRole: dto.assignedRole,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    transaction.tasks = [...(transaction.tasks ?? []), newTask];
    const updated = await this.transactionsRepository.save(transaction);

    const recipients = this.resolveRoleRecipients(transaction, dto.assignedRole);
    await Promise.all(
      recipients.map((userId) =>
        this.notificationsService.createNotification(
          userId,
          `New task assigned for transaction ${transaction.id}: ${dto.title}.`,
        ),
      ),
    );

    return updated;
  }

  private resolveRoleRecipients(transaction: Transaction, role: Role): string[] {
    switch (role) {
      case Role.BUYER:
        return [transaction.deal.buyerId];
      case Role.SELLER:
        return [transaction.deal.sellerId];
      case Role.AGENT:
        return [transaction.deal.agentId];
      case Role.CONVEYANCER:
        return [transaction.deal.conveyancerId];
      case Role.ADMIN:
      default:
        return [
          transaction.deal.buyerId,
          transaction.deal.sellerId,
          transaction.deal.agentId,
          transaction.deal.conveyancerId,
        ];
    }
  }
}
