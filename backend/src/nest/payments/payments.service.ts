import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Payment } from './payment.entity';
import { PaymentAuditLog } from './payment-audit-log.entity';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { PaymentStatus } from './enums/payment-status.enum';
import { Transaction } from '../transactions/transaction.entity';
import { TransactionState } from '../transactions/enums/transaction-state.enum';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
    @InjectRepository(PaymentAuditLog)
    private readonly auditRepository: Repository<PaymentAuditLog>,
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
    private readonly dataSource: DataSource,
  ) {}

  async initiate(dto: InitiatePaymentDto): Promise<Payment> {
    return this.dataSource.transaction(async (manager) => {
      const payment = await manager.save(
        Payment,
        manager.create(Payment, {
          dealId: dto.dealId,
          payerId: dto.payerId,
          amount: dto.amount.toFixed(2),
          currency: dto.currency,
          status: PaymentStatus.HELD,
          paymentMethod: dto.paymentMethod,
        }),
      );

      await this.recordAudit(manager, payment.id, 'PAYMENT_INITIATED', {
        dealId: dto.dealId,
        payerId: dto.payerId,
        amount: dto.amount,
        currency: dto.currency,
        paymentMethod: dto.paymentMethod,
        status: PaymentStatus.HELD,
      });

      return payment;
    });
  }

  async getByDealId(dealId: string): Promise<Payment[]> {
    return this.paymentsRepository.find({
      where: { dealId },
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(paymentId: string, dto: UpdatePaymentStatusDto): Promise<Payment> {
    return this.dataSource.transaction(async (manager) => {
      const payment = await manager.findOne(Payment, { where: { id: paymentId } });
      if (!payment) {
        throw new NotFoundException('Payment not found');
      }

      if (dto.status === PaymentStatus.RELEASED) {
        await this.assertDealTransferCompleted(payment.dealId);
      }

      const previous = payment.status;
      payment.status = dto.status;

      const updated = await manager.save(Payment, payment);
      await this.recordAudit(manager, updated.id, 'PAYMENT_STATUS_UPDATED', {
        previousStatus: previous,
        newStatus: updated.status,
      });

      return updated;
    });
  }

  async releaseHeldPaymentsForDeal(dealId: string): Promise<void> {
    await this.assertDealTransferCompleted(dealId);

    await this.dataSource.transaction(async (manager) => {
      const heldPayments = await manager.find(Payment, {
        where: { dealId, status: PaymentStatus.HELD },
      });

      for (const payment of heldPayments) {
        payment.status = PaymentStatus.RELEASED;
        await manager.save(Payment, payment);
        await this.recordAudit(manager, payment.id, 'ESCROW_RELEASED', {
          reason: 'Transaction reached TRANSFER_COMPLETED',
        });
      }
    });
  }

  private async assertDealTransferCompleted(dealId: string): Promise<void> {
    const dealTransaction = await this.transactionsRepository.findOne({
      where: { dealId },
    });

    if (!dealTransaction || dealTransaction.currentState !== TransactionState.TRANSFER_COMPLETED) {
      throw new BadRequestException(
        'Escrow funds can only be released after transaction reaches TRANSFER_COMPLETED',
      );
    }
  }

  private async recordAudit(
    manager: EntityManager,
    paymentId: string,
    action: string,
    metaJson: Record<string, unknown>,
  ): Promise<void> {
    await manager.save(
      PaymentAuditLog,
      manager.create(PaymentAuditLog, {
        paymentId,
        action,
        metaJson,
      }),
    );
  }
}
