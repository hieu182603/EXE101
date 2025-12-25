import { z } from "zod";

/**
 * Zod schemas for Customer DTOs
 */

const phoneRegex = /^(0|\+84)\d{9,10}$/;
const usernameRegex = /^[a-zA-Z0-9_-]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

export const CreateCustomerSchema = z.object({
  username: z.string()
    .min(4, "Username phải từ 4-20 ký tự")
    .max(20, "Username phải từ 4-20 ký tự")
    .regex(usernameRegex, "Username chỉ được chứa chữ cái, số, gạch dưới và gạch ngang"),
  password: z.string()
    .min(8, "Password phải từ 8-50 ký tự")
    .max(50, "Password phải từ 8-50 ký tự")
    .regex(passwordRegex, "Password phải chứa ít nhất 1 chữ thường, 1 chữ hoa và 1 số"),
  fullName: z.string()
    .min(2, "Họ tên phải từ 2-100 ký tự")
    .max(100, "Họ tên phải từ 2-100 ký tự"),
  phone: z.string()
    .regex(phoneRegex, "Số điện thoại không hợp lệ (phải có định dạng 0xxxxxxxxx hoặc +84xxxxxxxxx)"),
});

export const UpdateCustomerSchema = z.object({
  username: z.string()
    .min(4, "Username phải từ 4-30 ký tự")
    .max(30, "Username phải từ 4-30 ký tự")
    .regex(usernameRegex, "Username chỉ được chứa chữ cái, số, gạch dưới và gạch ngang")
    .optional(),
  password: z.string()
    .min(8, "Password phải từ 8-50 ký tự")
    .max(50, "Password phải từ 8-50 ký tự")
    .regex(passwordRegex, "Password phải chứa ít nhất 1 chữ thường, 1 chữ hoa và 1 số")
    .optional(),
  fullName: z.string()
    .min(2, "Họ tên phải từ 2-100 ký tự")
    .max(100, "Họ tên phải từ 2-100 ký tự")
    .optional(),
  phone: z.string()
    .regex(phoneRegex, "Số điện thoại không hợp lệ (phải có định dạng 0xxxxxxxxx hoặc +84xxxxxxxxx)")
    .optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update",
});

// Type exports
export type CreateCustomerDto = z.infer<typeof CreateCustomerSchema>;
export type UpdateCustomerDto = z.infer<typeof UpdateCustomerSchema>;






