import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsUUID, Min } from 'class-validator';
import { PaymentCurrency } from '../enums/payment-currency.enum';
import { PaymentMethod } from '../enums/payment-method.enum';

export class InitiatePaymentDto {
  @IsUUID()
  dealId!: string;

  @IsUUID()
  payerId!: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount!: number;

  @IsEnum(PaymentCurrency)
  currency!: PaymentCurrency;

  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;
}
