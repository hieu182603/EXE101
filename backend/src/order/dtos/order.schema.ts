import { z } from "zod";

/**
 * Zod schemas for Order DTOs
 */

export const OrderStatusEnum = z.enum([
  "PENDING",
  "ASSIGNED",
  "CONFIRMED",
  "SHIPPING",
  "DELIVERED",
  "CANCELLED",
  "EXTERNAL",
]);

export type OrderStatus = z.infer<typeof OrderStatusEnum>;

export const GuestInfoSchema = z.object({
  fullName: z.string().min(2, "Họ tên phải từ 2-100 ký tự").max(100, "Họ tên phải từ 2-100 ký tự"),
  phone: z.string().min(10, "Số điện thoại không hợp lệ").max(15, "Số điện thoại không hợp lệ"),
  email: z.string().email("Email không hợp lệ").min(1, "Email không được để trống"),
});

export const GuestCartItemSchema = z.object({
  productId: z.string().min(1, "Product ID không được để trống"),
  quantity: z.number().int("Số lượng phải là số nguyên").min(1, "Số lượng tối thiểu là 1").max(99, "Số lượng tối đa là 99"),
  price: z.number().min(0, "Giá không được âm"),
  name: z.string().min(1, "Tên sản phẩm không được để trống").max(255, "Tên sản phẩm phải từ 1-255 ký tự"),
});

export const CreateOrderSchema = z.object({
  shippingAddress: z.string().min(10, "Địa chỉ giao hàng phải có độ dài từ 10 đến 500 ký tự").max(500, "Địa chỉ giao hàng phải có độ dài từ 10 đến 500 ký tự"),
  note: z.string().max(500, "Ghi chú không được vượt quá 500 ký tự").optional(),
  paymentMethod: z.string().max(100, "Hình thức thanh toán không được vượt quá 100 ký tự").optional(),
  requireInvoice: z.boolean().optional().default(false),
  isGuest: z.boolean().optional(),
  guestInfo: GuestInfoSchema.optional(),
  guestCartItems: z.array(GuestCartItemSchema).optional(),
});

export const UpdateOrderSchema = z.object({
  status: OrderStatusEnum,
  cancelReason: z.string()
    .min(10, "Lý do hủy phải từ 10-200 ký tự")
    .max(200, "Lý do hủy phải từ 10-200 ký tự")
    .optional(),
}).refine((data) => {
  // If status is CANCELLED, cancelReason is required
  if (data.status === "CANCELLED" && !data.cancelReason) {
    return false;
  }
  return true;
}, {
  message: "Lý do hủy không được để trống khi hủy đơn hàng",
  path: ["cancelReason"],
});

// Type exports
export type GuestInfoDto = z.infer<typeof GuestInfoSchema>;
export type GuestCartItemDto = z.infer<typeof GuestCartItemSchema>;
export type CreateOrderDto = z.infer<typeof CreateOrderSchema>;
export type UpdateOrderDto = z.infer<typeof UpdateOrderSchema>;














