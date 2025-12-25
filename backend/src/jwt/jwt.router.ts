import { Router } from "express";
import { Container } from "typedi";
import { JwtController } from "./jwt.controller";
import { validate } from "@/middlewares/validation.middleware";
import { z } from "zod";

const router = Router();
const jwtController = Container.get(JwtController);

/**
 * POST /api/jwt/refresh-token
 * Refresh access token using refresh token from cookie
 */
router.post("/jwt/refresh-token", async (req, res, next) => {
  try {
    const result = await jwtController.refreshToken(req, res);
    if (result) {
      res.json({
        success: true,
        message: "Token refreshed successfully",
        data: {
          accessToken: result,
        },
      });
    }
  } catch (error: any) {
    next(error);
  }
});

/**
 * POST /api/jwt/verify-access-token
 * Verify access token validity
 */
router.post("/jwt/verify-access-token", validate(z.object({ token: z.string().min(1, "Token is required") })), async (req, res, next) => {
  try {
    const result = await jwtController.verifyAccessToken(req.body.token);
    res.json({
      success: true,
      message: "Token is valid",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
});

export default router;



