import { IsEnum } from 'class-validator';
import { TransactionState } from '../../transactions/enums/transaction-state.enum';

export class OverrideTransactionStateDto {
  @IsEnum(TransactionState)
  state!: TransactionState;
}
