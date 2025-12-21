import { IsNotEmpty, IsOptional, IsString, IsEnum } from "class-validator";
import { InvoiceStatus } from "../invoice.entity";

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

export class InvoiceResponseDto {
  id: string;
  invoiceNumber: string;
  totalAmount: number;
  status: InvoiceStatus;
  paymentMethod: string;
  paidAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  order: {
    id: string;
    totalAmount: number;
    orderDate: Date;
    status: string;
  };
  payment?: {
    id: string;
    amount: number;
    status: string;
    method: string;
  };
} 