import {
  Body,
  Controller,
  Get,
  Post,
  QueryParam,
  Req,
  UseBefore,
  Param,
} from "routing-controllers";
import { Service } from "typedi";
import { PaymentService } from "./payment.service";
import { Auth } from "@/middlewares/auth.middleware";
import { AccountDetailsDto } from "@/auth/dtos/account.dto";
import { JwtService } from "@/auth/jwt/jwt.service";
import { UpdatePaymentStatusDto } from "./dtos/payment.dto";

@Service()
@Controller("/payment")
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly jwtService: JwtService
  ) {}

  @Post("/update-payment-status")
  async updatePaymentStatus(@Body() body: UpdatePaymentStatusDto) {
    await this.paymentService.updatePaymentStatus(body.orderId, body.status, body.method);
  }

  /**
   * Get payment status by order ID - supports both authenticated and guest users
   * GET /api/payment/status/:orderId
   */
  @Get("/status/:orderId")
  async getPaymentStatus(@Param("orderId") orderId: string, @Req() req: any) {
    try {
      let username = null;
      
      // Try to get user from Authorization header if present
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
          const token = authHeader.substring(7);
          const decodedToken = this.jwtService.verifyAccessToken(token);
          if (decodedToken && decodedToken.username) {
            username = decodedToken.username;
          }
        } catch (error) {
          // Invalid token - treat as guest user
          username = null;
        }
      }

      const paymentStatus = await this.paymentService.getPaymentStatus(
        orderId,
        username
      );

      return {
        success: true,
        message: "Payment status retrieved successfully",
        data: paymentStatus
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to get payment status",
        error: error.message
      };
    }
  }

  /**
   * Get payment history for user
   * GET /api/payment/history
   */
  @Get("/history")
  @UseBefore(Auth)
  async getPaymentHistory(
    @Req() req: any,
    @QueryParam("page") page: number = 1,
    @QueryParam("limit") limit: number = 10
  ) {
    const user = req.user as AccountDetailsDto;
    const history = await this.paymentService.getPaymentHistory(
      user.username,
      page,
      limit
    );

    return {
      payments: history.payments,
      pagination: {
        page,
        limit,
        total: history.total,
        totalPages: Math.ceil(history.total / limit),
      },
    };
  }
}
