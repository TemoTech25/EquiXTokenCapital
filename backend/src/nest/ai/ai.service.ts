import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Deal } from '../deals/deal.entity';
import { Transaction } from '../transactions/transaction.entity';
import { KycRecord } from '../kyc/kyc-record.entity';
import { Payment } from '../payments/payment.entity';
import { TransactionState } from '../transactions/enums/transaction-state.enum';
import { VerificationStatus } from '../kyc/enums/verification-status.enum';
import { PaymentStatus } from '../payments/enums/payment-status.enum';

interface ParsedDocumentOutput {
  names: string[];
  idNumbers: string[];
  riskFlags: string[];
  confidence: number;
}

@Injectable()
export class AiService {
  private readonly openAiKey?: string;

  constructor(
    @InjectRepository(Deal)
    private readonly dealsRepository: Repository<Deal>,
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
    @InjectRepository(KycRecord)
    private readonly kycRepository: Repository<KycRecord>,
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
    configService: ConfigService,
  ) {
    this.openAiKey = configService.get<string>('OPENAI_API_KEY');
  }

  async parseDocument(text: string): Promise<ParsedDocumentOutput> {
    if (this.openAiKey) {
      const aiResult = await this.parseWithOpenAi(text);
      if (aiResult) {
        return aiResult;
      }
    }

    return this.parseWithRegexFallback(text);
  }

  async suggestions(dealId: string) {
    const deal = await this.dealsRepository.findOne({ where: { id: dealId } });
    if (!deal) {
      throw new NotFoundException('Deal not found');
    }

    const transaction = await this.transactionsRepository.findOne({ where: { dealId } });
    const payments = await this.paymentsRepository.find({ where: { dealId } });
    const kycRecords = await this.kycRepository.findBy([
      { userId: deal.buyerId },
      { userId: deal.sellerId },
    ]);

    const suggestions: string[] = [];
    const riskFlags: string[] = [];

    if (!transaction) {
      suggestions.push('Create transaction workflow for this deal.');
    } else {
      suggestions.push(this.suggestNextStep(transaction.currentState));
      if (transaction.currentState !== TransactionState.TRANSFER_COMPLETED) {
        riskFlags.push('Transaction not yet completed.');
      }
    }

    const hasRejectedKyc = kycRecords.some(
      (record) => record.verificationStatus === VerificationStatus.REJECTED,
    );
    const hasPendingKyc = kycRecords.some(
      (record) => record.verificationStatus === VerificationStatus.PENDING,
    );

    if (hasRejectedKyc) {
      riskFlags.push('KYC rejected for one or more parties.');
    } else if (hasPendingKyc) {
      suggestions.push('Resolve pending KYC checks before completion.');
    }

    const hasHeldPayments = payments.some((payment) => payment.status === PaymentStatus.HELD);
    if (hasHeldPayments && transaction?.currentState !== TransactionState.TRANSFER_COMPLETED) {
      suggestions.push('Maintain escrow hold until transfer completion.');
    }

    return {
      dealId,
      currentState: transaction?.currentState ?? null,
      suggestions,
      riskFlags,
    };
  }

  private suggestNextStep(state: TransactionState): string {
    switch (state) {
      case TransactionState.CREATED:
        return 'Make an offer and move deal to OFFER_MADE.';
      case TransactionState.OFFER_MADE:
        return 'Collect acceptance and move to OFFER_ACCEPTED.';
      case TransactionState.OFFER_ACCEPTED:
        return 'Collect required documents and move to DOCUMENTS_PENDING.';
      case TransactionState.DOCUMENTS_PENDING:
        return 'Run compliance checks and move to COMPLIANCE_CHECK.';
      case TransactionState.COMPLIANCE_CHECK:
        return 'Initiate transfer and move to TRANSFER_INITIATED.';
      case TransactionState.TRANSFER_INITIATED:
        return 'Complete transfer and finalize at TRANSFER_COMPLETED.';
      case TransactionState.TRANSFER_COMPLETED:
      default:
        return 'Deal workflow is complete. Prepare closure report.';
    }
  }

  private parseWithRegexFallback(text: string): ParsedDocumentOutput {
    const idMatches = text.match(/\b\d{6,13}\b/g) ?? [];
    const nameMatches = text.match(/\b[A-Z][a-z]+\s[A-Z][a-z]+\b/g) ?? [];

    const riskFlags: string[] = [];
    if (idMatches.length === 0) {
      riskFlags.push('No likely ID number detected.');
    }
    if (nameMatches.length === 0) {
      riskFlags.push('No likely full name detected.');
    }

    return {
      names: Array.from(new Set(nameMatches)).slice(0, 10),
      idNumbers: Array.from(new Set(idMatches)).slice(0, 10),
      riskFlags,
      confidence: 0.55,
    };
  }

  private async parseWithOpenAi(text: string): Promise<ParsedDocumentOutput | null> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.openAiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4.1-mini',
          messages: [
            {
              role: 'system',
              content:
                'Extract document entities and return strict JSON with keys: names (string[]), idNumbers (string[]), riskFlags (string[]), confidence (number 0..1).',
            },
            { role: 'user', content: text.slice(0, 12000) },
          ],
          temperature: 0,
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        return null;
      }

      const payload = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = payload.choices?.[0]?.message?.content;
      if (!content) {
        return null;
      }

      const parsed = JSON.parse(content) as ParsedDocumentOutput;
      return {
        names: Array.isArray(parsed.names) ? parsed.names : [],
        idNumbers: Array.isArray(parsed.idNumbers) ? parsed.idNumbers : [],
        riskFlags: Array.isArray(parsed.riskFlags) ? parsed.riskFlags : [],
        confidence:
          typeof parsed.confidence === 'number'
            ? Math.max(0, Math.min(1, parsed.confidence))
            : 0.75,
      };
    } catch {
      return null;
    }
  }
}
