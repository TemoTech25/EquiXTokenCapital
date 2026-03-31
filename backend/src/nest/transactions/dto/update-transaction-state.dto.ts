import { IsEnum } from 'class-validator';
import { TransactionState } from '../enums/transaction-state.enum';

export class UpdateTransactionStateDto {
  @IsEnum(TransactionState)
  state!: TransactionState;
}
