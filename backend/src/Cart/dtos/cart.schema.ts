import { z } from "zod";

export const AddToCartSchema = z.object({
    productId: z.string().uuid(),
    quantity: z.number().min(1)
});

export const UpdateCartItemSchema = z.object({
    quantity: z.number().min(0)
});

export type AddToCartInput = z.infer<typeof AddToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof UpdateCartItemSchema>;



