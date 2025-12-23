import { z } from "zod";

/**
 * Zod schemas for Invoice DTOs
 */

export const InvoiceStatusEnum = z.enum([
  "UNPAID",
  "PAID",
  "CANCELLED",
]);

export type InvoiceStatus = z.infer<typeof InvoiceStatusEnum>;

export const CreateInvoiceSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  paymentMethod: z.string().optional().default("COD"),
  notes: z.string().optional(),
});

export const UpdateInvoiceStatusSchema = z.object({
  status: InvoiceStatusEnum,
  reason: z.string().optional(),
});

// Type exports
export type CreateInvoiceDto = z.infer<typeof CreateInvoiceSchema>;
export type UpdateInvoiceStatusDto = z.infer<typeof UpdateInvoiceStatusSchema>;

