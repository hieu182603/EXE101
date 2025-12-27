import { z } from "zod";

/**
 * Zod schemas for Payment DTOs
 */

export const CreatePaymentSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  amount: z.number().min(1, "Amount must be at least 1"),
  bankCode: z.string().optional(),
  orderInfo: z.string().optional(),
  locale: z.string().optional().default("vn"),
});

export const UpdatePaymentStatusSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  status: z.string().min(1, "Status is required"),
  method: z.string().min(1, "Payment method is required"),
});

// Type exports
export type CreatePaymentDto = z.infer<typeof CreatePaymentSchema>;
export type UpdatePaymentStatusDto = z.infer<typeof UpdatePaymentStatusSchema>;



























