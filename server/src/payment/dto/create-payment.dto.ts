import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { PaymentMethod } from '../enums/payment-method.enum';

export class CreatePaymentDto {

  @IsNotEmpty()
  @IsNumber()
  reservationId: number;

  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  method: PaymentMethod;
}