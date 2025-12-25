import { Router } from "express";
import { Container } from "typedi";
import { OtpController } from "./otp.controller";
import { validate } from "@/middlewares/validation.middleware";
import { z } from "zod";

const router = Router();
const otpController = Container.get(OtpController);

/**
 * GET /api/otp/active
 * Get all active OTPs (for debugging/admin)
 */
router.get("/otp/active", async (req, res, next) => {
  try {
    const result = await otpController.getActiveOtp();
    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
});

/**
 * POST /api/otp/send
 * Send OTP to identifier (email or phone)
 */
router.post("/otp/send", validate(z.object({
  identifier: z.string().min(1, "Identifier is required"),
  username: z.string().optional(),
})), async (req, res, next) => {
  try {
    const result = await otpController.sendOtp(req.body.identifier, req.body.username);
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
 * POST /api/otp/verify
 * Verify OTP code
 */
router.post("/otp/verify", validate(z.object({
  identifier: z.string().min(1, "Identifier is required"),
  otp: z.string().length(6, "OTP must be 6 digits").regex(/^\d+$/, "OTP must contain only digits"),
})), async (req, res, next) => {
  try {
    const result = await otpController.verifyOtp(req.body.identifier, req.body.otp);
    res.json({
      success: true,
      message: "OTP verified successfully",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
});

export default router;



