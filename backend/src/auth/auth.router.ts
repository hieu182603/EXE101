import { Router } from "express";
import { Container } from "typedi";
import { AccountController } from "./account/account.controller";
import { Auth, Admin } from "@/middlewares/auth.middleware";
import { checkAbility } from "@/middlewares/rbac/permission.middleware";
import { Account } from "./account/account.entity";
import { validate } from "@/middlewares/validation.middleware";
import {
  CreateAccountSchema,
  VerifyRegisterSchema,
  CredentialsSchema,
  UpdateAccountSchema,
  ResendOtpSchema,
  SendOtpSchema,
  VerifyOtpSchema,
  ChangePasswordSchema,
  VerifyChangePasswordSchema,
  ForgotPasswordSchema,
  LogoutSchema,
  CreateAccountAdminSchema,
  DeleteAccountSchema,
} from "./dtos/account.schema";
import { OtpService } from "@/otp/otp.service";
import { AccountService } from "./account/account.service";

const router = Router();
const accountController = Container.get(AccountController);
const accountService = Container.get(AccountService);
const otpService = Container.get(OtpService);

// ==================== Account Routes ====================

/**
 * POST /api/account/register
 * Register a new account (sends OTP email)
 */
router.post("/account/register", validate(CreateAccountSchema), async (req, res, next) => {
  try {
    const result = await accountController.register(req.body);
    res.json({
      success: true,
      message: "Registration initiated. Please check your email for OTP.",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
});

/**
 * POST /api/account/verify-register
 * Verify registration with OTP and complete account setup
 * Returns accessToken directly (string) to match frontend expectations
 */
router.post("/account/verify-register", validate(VerifyRegisterSchema), async (req, res, next) => {
  try {
    const result = await accountController.verifyRegister(req.body, res);
    // Frontend expects accessToken as string directly
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

/**
 * DELETE /api/account/registration-cancelled
 * Clean up cancelled registrations (admin only)
 */
router.delete("/account/registration-cancelled", Admin as any, async (req, res, next) => {
  try {
    await accountController.cancelRegistrations();
    res.json({
      success: true,
      message: "Cancelled registrations removed successfully",
    });
  } catch (error: any) {
    next(error);
  }
});

/**
 * POST /api/account/login
 * Login with username/email and password
 * Returns accessToken directly (string) to match frontend expectations
 */
router.post("/account/login", validate(CredentialsSchema), async (req, res, next) => {
  try {
    const result = await accountController.login(req.body, res);
    // Frontend expects accessToken as string directly
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

/**
 * POST /api/account/logout
 * Logout and invalidate refresh token
 */
router.post("/account/logout", validate(LogoutSchema), async (req, res, next) => {
  try {
    const result = await accountController.logout(req.body.username);
    res.json({
      success: true,
      message: result,
    });
  } catch (error: any) {
    next(error);
  }
});

/**
 * GET /api/account/details
 * Get current user account details (requires authentication)
 */
router.get("/account/details", Auth as any, async (req: any, res, next) => {
  try {
    const result = await accountController.viewAccountDetails(req);
    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
});

/**
 * POST /api/account/resend-otp
 * Resend OTP to email or phone
 */
router.post("/account/resend-otp", validate(ResendOtpSchema), async (req, res, next) => {
  try {
    const result = await otpService.sendOtp(req.body.identifier);
    res.json({
      success: true,
      message: "OTP resent successfully",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
});

/**
 * POST /api/account/send-otp
 * Send OTP to account's email or phone
 */
router.post("/account/send-otp", validate(SendOtpSchema), async (req, res, next) => {
  try {
    const account = await accountService.findAccountByUsername(req.body.username);
    const identifier = account.email || account.phone;
    if (!identifier) {
      res.status(400).json({
        success: false,
        message: "Account does not have email or phone",
      });
      return;
    }
    const result = await otpService.sendOtp(identifier, account.name);
    res.json({
      success: true,
      message: "OTP sent successfully",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
});

/**
 * POST /api/account/verify-otp
 * Verify OTP code
 */
router.post("/account/verify-otp", validate(VerifyOtpSchema), async (req, res, next) => {
  try {
    const account = await accountService.findAccountByUsername(req.body.username);
    const identifier = account.email || account.phone;
    if (!identifier) {
      res.status(400).json({
        success: false,
        message: "Account does not have email or phone",
      });
      return;
    }
    const result = await otpService.verifyOtp(identifier, req.body.otp);
    res.json({
      success: true,
      message: "OTP verified successfully",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
});

/**
 * POST /api/account/change-password
 * Initiate password change (sends OTP)
 */
router.post("/account/change-password", Auth as any, validate(ChangePasswordSchema), async (req: any, res, next) => {
  try {
    const result = await accountController.preChangePassword(req, req.body.oldPassword);
    res.json({
      success: true,
      message: result || "OTP sent to your email. Please verify to complete password change.",
    });
  } catch (error: any) {
    next(error);
  }
});

/**
 * POST /api/account/verify-change-password
 * Verify OTP and change password
 */
router.post("/account/verify-change-password", validate(VerifyChangePasswordSchema), async (req, res, next) => {
  try {
    const result = await accountController.verifyChangePassword(
      req.body.email,
      req.body.otp,
      req.body.newPassword
    );
    res.json({
      success: true,
      message: "Password changed successfully",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
});

/**
 * POST /api/account/forgot-password
 * Request password reset (sends OTP)
 */
router.post("/account/forgot-password", validate(ForgotPasswordSchema), async (req, res, next) => {
  try {
    const result = await accountController.forgotPassword(req.body.email);
    res.json({
      success: true,
      message: result || "OTP sent to your email. Please verify to reset password.",
    });
  } catch (error: any) {
    next(error);
  }
});

/**
 * GET /api/account/all
 * Get all accounts (requires authentication and read permission)
 */
router.get("/account/all", Auth as any, checkAbility("read", Account), async (req: any, res, next) => {
  try {
    const result = await accountController.getAllAccounts(req);
    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
});

/**
 * POST /api/account/create
 * Create new account (requires authentication and create permission)
 */
router.post("/account/create", Auth as any, checkAbility("create", Account), validate(CreateAccountAdminSchema), async (req: any, res, next) => {
  try {
    const result = await accountController.createAccount(req.body, req);
    res.json({
      success: true,
      message: "Account created successfully",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
});

/**
 * PATCH /api/account/update
 * Update account (requires authentication and update permission)
 */
router.patch("/account/update", Auth as any, checkAbility("update", Account), validate(UpdateAccountSchema), async (req: any, res, next) => {
  try {
    // Get username from body or use oldUsername
    const username = req.body.username || req.body.oldUsername;
    if (!username) {
      res.status(400).json({
        success: false,
        message: "Username is required for update",
      });
      return;
    }
    const result = await accountController.updateAccount(username, req.body, req);
    res.json({
      success: true,
      message: "Account updated successfully",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
});

/**
 * DELETE /api/account/delete
 * Delete account (requires authentication and delete permission)
 */
router.delete("/account/delete", Auth as any, checkAbility("delete", Account), validate(DeleteAccountSchema), async (req: any, res, next) => {
  try {
    const result = await accountController.deleteAccount(req.body.username, req);
    res.json({
      success: true,
      message: "Account deleted successfully",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
});

/**
 * PATCH /api/account/update-admin
 * Update admin account (admin only)
 */
router.patch("/account/update-admin", Admin as any, validate(UpdateAccountSchema), async (req: any, res, next) => {
  try {
    const username = req.body.username || req.body.oldUsername;
    if (!username) {
      res.status(400).json({
        success: false,
        message: "Username is required for update",
      });
      return;
    }
    const result = await accountController.updateAdmin(username, req.body);
    res.json({
      success: true,
      message: "Admin account updated successfully",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
});

export default router;
