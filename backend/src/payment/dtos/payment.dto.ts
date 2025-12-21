import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from "class-validator";

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  amount: number;

  @IsOptional()
  @IsString()
  bankCode?: string;

  @IsOptional()
  @IsString()
  orderInfo?: string;

  @IsOptional()
  @IsString()
  locale?: string = "vn";
}


export class PaymentStatusDto {
  orderId: string;
  status: string;
  amount: number;
  transactionId?: string;
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
}

export class UpdatePaymentStatusDto {
  @IsString()
  orderId: string;

  @IsString()
  status: string;

  @IsString()
  method: string;
}
