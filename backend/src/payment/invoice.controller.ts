import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  QueryParam,
  Req,
  UseBefore,
} from "routing-controllers";
import { Service } from "typedi";
import { InvoiceService } from "./invoice.service";
import { Auth, Admin } from "@/middlewares/auth.middleware";
import { AccountDetailsDto } from "@/auth/dtos/account.schema";
import { JwtService } from "@/jwt/jwt.service";
import { Invoice } from "./invoice.entity";
import { CheckAbility } from "@/middlewares/rbac/permission.decorator";
import { getRepository, Between } from "typeorm";
import { HttpException } from "@/exceptions/http-exceptions";

@Service()
@Controller("/invoices")
export class InvoiceController {
  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly jwtService: JwtService
  ) {}

  /**
   * Create invoice for order - supports both authenticated and guest orders
   * POST /api/invoices/create
   */
  @Post("/create")
  async createInvoice(
    @Body() body: { orderId: string; paymentMethod?: string },
    @Req() req: any
  ) {
    try {
      const invoice = await this.invoiceService.createInvoiceForOrder(
        body.orderId,
        body.paymentMethod || 'COD'
      );

      return {
        success: true,
        message: "Invoice created successfully",
        data: invoice
      };
    } catch (error: any) {
      throw new HttpException(500, error?.message || "Failed to create invoice");
    }
  }

  /**
   * Get invoice by order ID - supports both authenticated and guest users
   * GET /api/invoices/order/:orderId
   */
  @Get("/order/:orderId")
  async getInvoiceByOrderId(@Param("orderId") orderId: string, @Req() req: any) {
    try {
      let user = null;
      
      // Try to get user from Authorization header if present
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
          const token = authHeader.substring(7);
          const decodedToken = this.jwtService.verifyAccessToken(token);
          if (decodedToken && decodedToken.username) {
            // Mock user object for compatibility
            user = { 
              username: decodedToken.username, 
              role: decodedToken.role || { name: 'customer' }
            };
          }
        } catch (error) {
          // Invalid token - treat as guest user
          user = null;
        }
      }

      const invoice = await this.invoiceService.getInvoiceByOrderId(orderId);

      if (!invoice) {
        throw new HttpException(404, "Invoice not found");
      }

      // Authorization logic
      if (user) {
        // Authenticated user
        const isOwner = invoice.order.customer ? 
          invoice.order.customer.username === user.username : false;
        const isAdminOrStaff = user.role?.name === 'admin' || user.role?.name === 'staff';

        if (!isOwner && !isAdminOrStaff) {
          throw new HttpException(401, "Unauthorized access to invoice");
        }
      } else {
        // Guest user - can only access invoices for guest orders
        if (invoice.order.customer) {
          throw new HttpException(401, "Cannot access user invoice as guest");
        }
      }

      return {
        success: true,
        data: invoice
      };
    } catch (error: any) {
      throw new HttpException(500, error?.message || "Failed to get invoice");
    }
  }

  /**
   * Get invoice by invoice number - supports both authenticated and guest users
   * GET /api/invoices/number/:invoiceNumber
   */
  @Get("/number/:invoiceNumber")
  async getInvoiceByNumber(@Param("invoiceNumber") invoiceNumber: string, @Req() req: any) {
    try {
      let user = null;
      
      // Try to get user from Authorization header if present
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
          const token = authHeader.substring(7);
          const decodedToken = this.jwtService.verifyAccessToken(token);
          if (decodedToken && decodedToken.username) {
            // Mock user object for compatibility
            user = { 
              username: decodedToken.username, 
              role: decodedToken.role || { name: 'customer' }
            };
          }
        } catch (error) {
          // Invalid token - treat as guest user
          user = null;
        }
      }

      const invoice = await this.invoiceService.getInvoiceByNumber(invoiceNumber);

      if (!invoice) {
        throw new HttpException(404, "Invoice not found");
      }

      // Authorization logic
      if (user) {
        // Authenticated user
        const isOwner = invoice.order.customer ? 
          invoice.order.customer.username === user.username : false;
        const isAdminOrStaff = user.role?.name === 'admin' || user.role?.name === 'staff';

        if (!isOwner && !isAdminOrStaff) {
          throw new HttpException(401, "Unauthorized access to invoice");
        }
      } else {
        // Guest user - can only access invoices for guest orders
        if (invoice.order.customer) {
          throw new HttpException(401, "Cannot access user invoice as guest");
        }
      }

      return {
        success: true,
        data: invoice
      };
    } catch (error: any) {
      throw new HttpException(500, error?.message || "Failed to get invoice");
    }
  }

  /**
   * Get user's invoices
   * GET /api/invoices/my
   */
  @Get("/my")
  @UseBefore(Auth)
  async getMyInvoices(
    @Req() req: any,
    @QueryParam("page") page: number = 1,
    @QueryParam("limit") limit: number = 10
  ) {
    try {
      const user = req.user as AccountDetailsDto;
      const result = await this.invoiceService.getInvoicesByCustomer(
        user.username,
        page,
        limit
      );

      return {
        success: true,
        data: result.invoices,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages
        }
      };
    } catch (error: any) {
      throw new HttpException(500, error?.message || "Failed to get invoices");
    }
  }

  /**
   * Mark invoice as paid (for COD - admin/staff only)
   * PUT /api/invoices/:id/paid
   */
  @Put("/:id/paid")
  @UseBefore(Auth)
  @CheckAbility("update", Invoice)
  async markAsPaid(@Param("id") invoiceId: string, @Req() req: any) {
    try {
      const invoice = await this.invoiceService.markInvoiceAsPaid(invoiceId);

      return {
        success: true,
        message: "Invoice marked as paid successfully",
        data: invoice
      };
    } catch (error: any) {
      throw new HttpException(500, error?.message || "Failed to mark invoice as paid");
    }
  }

  /**
   * Cancel invoice (admin only)
   * PUT /api/invoices/:id/cancel
   */
  @Put("/:id/cancel")
  @UseBefore(Admin)
  async cancelInvoice(
    @Param("id") invoiceId: string,
    @Body() body: { reason?: string }
  ) {
    try {
      const invoice = await this.invoiceService.cancelInvoice(
        invoiceId,
        body.reason
      );

      return {
        success: true,
        message: "Invoice cancelled successfully",
        data: invoice
      };
    } catch (error: any) {
      throw new HttpException(500, error?.message || "Failed to cancel invoice");
    }

  }
} 