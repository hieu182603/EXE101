import { z } from "zod";

/**
 * Zod schemas for Cart DTOs
 */

export const AddToCartSchema = z.object({
  productId: z.string().min(1, "Product ID không được để trống"),
  quantity: z.number().int("Số lượng phải là số nguyên").min(1, "Số lượng tối thiểu là 1").max(99, "Số lượng tối đa là 99"),
});

export const IncreaseQuantitySchema = z.object({
  productId: z.string().min(1, "Product ID không được để trống"),
  amount: z.number().int("Số lượng phải là số nguyên").min(1, "Số lượng tối thiểu là 1").optional().default(1),
});

export const DecreaseQuantitySchema = z.object({
  productId: z.string().min(1, "Product ID không được để trống"),
  amount: z.number().int("Số lượng phải là số nguyên").min(1, "Số lượng tối thiểu là 1").optional().default(1),
});

export const RemoveItemSchema = z.object({
  productId: z.string().min(1, "Product ID không được để trống"),
});

// Type exports
export type AddToCartDto = z.infer<typeof AddToCartSchema>;
export type IncreaseQuantityDto = z.infer<typeof IncreaseQuantitySchema>;
export type DecreaseQuantityDto = z.infer<typeof DecreaseQuantitySchema>;
export type RemoveItemDto = z.infer<typeof RemoveItemSchema>;













