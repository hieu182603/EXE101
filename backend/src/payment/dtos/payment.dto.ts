import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  IsDateString,
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
  @IsString()
  orderId: string;

  @IsString()
  status: string;

  @IsNumber()
  amount: number;

  @IsString()
  @IsOptional()
  transactionId?: string;

  @IsString()
  paymentMethod: string;

  @IsDateString()
  createdAt: Date;

  @IsDateString()
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
