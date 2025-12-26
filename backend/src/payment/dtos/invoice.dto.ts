import { IsNotEmpty, IsOptional, IsString, IsEnum, IsUUID, IsNumber, IsDateString, IsObject } from "class-validator";
import { InvoiceStatus } from "../invoice.entity";
import { OrderStatus } from "@/order/dtos/update-order.dto";

export class CreateInvoiceDto {
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string = 'COD';

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateInvoiceStatusDto {
  @IsEnum(InvoiceStatus)
  status: InvoiceStatus;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class InvoiceOrderDto {
  @IsUUID()
  id: string;

  @IsNumber()
  totalAmount: number;

  @IsDateString()
  orderDate: Date;

  @IsString()
  status: string;
}

export class InvoicePaymentDto {
  @IsUUID()
  id: string;

  @IsNumber()
  amount: number;

  @IsString()
  status: string;

  @IsString()
  method: string;
}

export class InvoiceResponseDto {
  @IsUUID()
  id: string;

  @IsString()
  invoiceNumber: string;

  @IsNumber()
  totalAmount: number;

  @IsEnum(InvoiceStatus)
  status: InvoiceStatus;

  @IsString()
  paymentMethod: string;

  @IsDateString()
  @IsOptional()
  paidAt?: Date;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsDateString()
  createdAt: Date;

  @IsDateString()
  updatedAt: Date;

  @IsObject()
  order: InvoiceOrderDto;

  @IsObject()
  @IsOptional()
  payment?: InvoicePaymentDto;
} 