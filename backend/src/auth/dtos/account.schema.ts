import { z } from "zod";

/**
 * Zod schemas for Account DTOs
 * Complete validation schemas for all auth endpoints
 */

// Login/Credentials
export const CredentialsSchema = z.object({
  username: z.string().optional(),
  email: z.string().email("Invalid email format").optional(),
  password: z.string().min(1, "Password is required"),
}).refine((data) => data.username || data.email, {
  message: "Either username or email must be provided",
  path: ["username"],
}).refine((data) => !(data.username && data.email), {
  message: "Provide either username or email, not both",
  path: ["username"],
});

// Registration
export const CreateAccountSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must not exceed 30 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens"),
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must not exceed 100 characters"),
  email: z.string()
    .email("Invalid email format")
    .min(1, "Email is required"),
  phone: z.string()
    .regex(/^(0|\+84)\d{9,10}$/, "Invalid phone number format")
    .optional(),
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters")
    .optional(),
  roleSlug: z.string().min(1, "Role slug is required"),
});

export const VerifyRegisterSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Invalid email format"),
  phone: z.string().optional(),
  roleSlug: z.string().min(1, "Role slug is required"),
  otp: z.string().length(6, "OTP must be 6 digits").regex(/^\d+$/, "OTP must contain only digits"),
});

// Update Account
export const UpdateAccountSchema = z.object({
  oldUsername: z.string().optional(),
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must not exceed 30 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens")
    .optional(),
  phone: z.string()
    .regex(/^(0|\+84)\d{9,10}$/, "Invalid phone number format")
    .optional(),
  email: z.string()
    .email("Invalid email format")
    .optional(),
  roleSlug: z.string().optional(),
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters")
    .optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update",
});

// OTP related schemas
export const ResendOtpSchema = z.object({
  identifier: z.string().min(1, "Identifier (email or phone) is required"),
});

export const SendOtpSchema = z.object({
  username: z.string().min(1, "Username is required"),
});

export const VerifyOtpSchema = z.object({
  username: z.string().min(1, "Username is required"),
  otp: z.string().length(6, "OTP must be 6 digits").regex(/^\d+$/, "OTP must contain only digits"),
});

// Password change schemas
export const ChangePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Old password is required"),
});

export const VerifyChangePasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
  otp: z.string().length(6, "OTP must be 6 digits").regex(/^\d+$/, "OTP must contain only digits"),
  newPassword: z.string()
    .min(6, "New password must be at least 6 characters")
    .max(100, "New password must not exceed 100 characters"),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format").min(1, "Email is required"),
});

// Logout schema
export const LogoutSchema = z.object({
  username: z.string().min(1, "Username is required"),
});

// Create account (admin) schema
export const CreateAccountAdminSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must not exceed 30 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens"),
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must not exceed 100 characters"),
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters")
    .optional(),
  phone: z.string()
    .regex(/^(0|\+84)\d{9,10}$/, "Invalid phone number format")
    .optional(),
  roleSlug: z.string().min(1, "Role slug is required"),
  email: z.string()
    .email("Invalid email format")
    .optional(),
});

// Delete account schema
export const DeleteAccountSchema = z.object({
  username: z.string().min(1, "Username is required"),
});

// Account Details schema
export const AccountDetailsSchema = z.object({
  accountId: z.string().uuid(),
  username: z.string(),
  phone: z.string().nullable(),
  role: z.object({
    id: z.string().uuid(),
    name: z.string(),
    slug: z.string(),
  }),
});

// Type exports for TypeScript
export type CredentialsDto = z.infer<typeof CredentialsSchema>;
export type CreateAccountDto = z.infer<typeof CreateAccountSchema>;
export type VerifyRegisterDto = z.infer<typeof VerifyRegisterSchema>;
export type UpdateAccountDto = z.infer<typeof UpdateAccountSchema>;
export type AccountDetailsDto = z.infer<typeof AccountDetailsSchema>;
export type ResendOtpDto = z.infer<typeof ResendOtpSchema>;
export type SendOtpDto = z.infer<typeof SendOtpSchema>;
export type VerifyOtpDto = z.infer<typeof VerifyOtpSchema>;
export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>;
export type VerifyChangePasswordDto = z.infer<typeof VerifyChangePasswordSchema>;
export type ForgotPasswordDto = z.infer<typeof ForgotPasswordSchema>;
export type LogoutDto = z.infer<typeof LogoutSchema>;
export type CreateAccountAdminDto = z.infer<typeof CreateAccountAdminSchema>;
export type DeleteAccountDto = z.infer<typeof DeleteAccountSchema>;
