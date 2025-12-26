import { Body, Controller, Delete, Get, Param, Post, Put, QueryParam, Req, UseBefore } from "routing-controllers";
import { Service } from "typedi";
import { CustomerService } from "./customer.service";
import { CreateCustomerDto, UpdateCustomerDto } from "./dtos/customer.dtos";
import { Auth } from "@/middlewares/auth.middleware";
import { getRepository } from "typeorm";
import { Account } from "@/auth/account/account.entity";
import { Order } from "@/order/order.entity";
import { AccountDetailsDto } from "@/auth/dtos/account.schema";

@Service()
@Controller("/customers")
export class CustomerController {
  constructor(
    private readonly customerService: CustomerService
  ) {}

  @Post("/")
  async createCustomer(@Body() createCustomerDto: CreateCustomerDto) {
    try {
      const customer = await this.customerService.createCustomer(createCustomerDto);
      return {
        success: true,
        data: customer,
        message: "Customer created successfully"
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to create customer",
        error: error.message || "Unknown error"
      };
    }
  }

  @Get("/")
  async getAllCustomers() {
    try {
      const customers = await this.customerService.getAllCustomers();
      return {
        success: true,
        data: customers,
        message: "Customers retrieved successfully"
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to retrieve customers",
        error: error.message || "Unknown error"
      };
    }
  }

  @Get("/search")
  async searchCustomers(@QueryParam("q") searchTerm: string) {
    try {
      if (!searchTerm) {
        return {
          success: false,
          message: "Search term is required"
        };
      }
      const customers = await this.customerService.searchCustomers(searchTerm);
      return {
        success: true,
        data: customers,
        message: "Customers found successfully"
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to search customers",
        error: error.message || "Unknown error"
      };
    }
  }

  @Get("/:id")
  async getCustomerById(@Param("id") id: string) {
    try {
      const customer = await this.customerService.getCustomerById(id);
      return {
        success: true,
        data: customer,
        message: "Customer retrieved successfully"
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to retrieve customer",
        error: error.message || "Unknown error"
      };
    }
  }

  @Put("/:id")
  async updateCustomer(
    @Param("id") id: string,
    @Body() updateCustomerDto: UpdateCustomerDto
  ) {
    try {
      const customer = await this.customerService.updateCustomer(id, updateCustomerDto);
      return {
        success: true,
        data: customer,
        message: "Customer updated successfully"
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to update customer",
        error: error.message || "Unknown error"
      };
    }
  }

  @Delete("/:id")
  async deleteCustomer(@Param("id") id: string) {
    try {
      await this.customerService.deleteCustomer(id);
      return {
        success: true,
        message: "Customer deleted successfully"
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to delete customer",
        error: error.message || "Unknown error"
      };
    }
  }

  @Get("/export")
  async exportCustomers() {
    try {
      // For now, return a placeholder response
      // TODO: Implement actual Excel generation logic
      return {
        success: true,
        message: "Export functionality is not yet implemented"
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to export customers",
        error: error.message || "Unknown error"
      };
    }
  }

  /**
   * Get customer growth analytics
   * GET /api/customers/analytics/growth?startDate=...&endDate=...&period=month
   */
  @Get("/analytics/growth")
  @UseBefore(Auth)
  async getCustomerGrowthAnalytics(
    @Req() req: any,
    @QueryParam("startDate") startDateStr: string,
    @QueryParam("endDate") endDateStr: string,
    @QueryParam("period") period: 'day' | 'month' | 'year' = 'month'
  ) {
    const user = req.user as AccountDetailsDto;

    // Only allow admin, manager, staff
    if (!this.isAdmin(user) && !this.isManager(user) && !this.isStaff(user)) {
      return {
        success: false,
        message: "Access denied to customer analytics"
      };
    }

    try {
      if (!startDateStr || !endDateStr) {
        return {
          success: false,
          message: "startDate and endDate are required"
        };
      }

      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return {
          success: false,
          message: "Invalid date format"
        };
      }

      const analytics = await this.generateCustomerGrowthAnalytics(startDate, endDate, period);

      return {
        success: true,
        message: "Customer growth analytics retrieved successfully",
        data: analytics
      };
    } catch (error: any) {
      console.error("Error getting customer growth analytics:", error);
      return {
        success: false,
        message: "Failed to retrieve customer growth analytics",
        error: error.message
      };
    }
  }

  /**
   * Get top customers by spending
   * GET /api/customers/analytics/top-spenders?startDate=...&endDate=...&limit=10
   */
  @Get("/analytics/top-spenders")
  @UseBefore(Auth)
  async getTopCustomersBySpending(
    @Req() req: any,
    @QueryParam("startDate") startDateStr: string,
    @QueryParam("endDate") endDateStr: string,
    @QueryParam("limit") limit: number = 10
  ) {
    const user = req.user as AccountDetailsDto;

    // Only allow admin, manager, staff
    if (!this.isAdmin(user) && !this.isManager(user) && !this.isStaff(user)) {
      return {
        success: false,
        message: "Access denied to customer analytics"
      };
    }

    try {
      if (!startDateStr || !endDateStr) {
        return {
          success: false,
          message: "startDate and endDate are required"
        };
      }

      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return {
          success: false,
          message: "Invalid date format"
        };
      }

      const topCustomers = await this.generateTopCustomersBySpending(startDate, endDate, limit);

      return {
        success: true,
        message: "Top customers by spending retrieved successfully",
        data: topCustomers
      };
    } catch (error: any) {
      console.error("Error getting top customers by spending:", error);
      return {
        success: false,
        message: "Failed to retrieve top customers by spending",
        error: error.message
      };
    }
  }

  // Helper methods for analytics
  private isAdmin(user: AccountDetailsDto): boolean {
    return user.role?.name?.toLowerCase().includes('admin') || false;
  }

  private isManager(user: AccountDetailsDto): boolean {
    return user.role?.name?.toLowerCase().includes('manager') || false;
  }

  private isStaff(user: AccountDetailsDto): boolean {
    return user.role?.name?.toLowerCase().includes('staff') || false;
  }

  private async generateCustomerGrowthAnalytics(
    startDate: Date,
    endDate: Date,
    period: 'day' | 'month' | 'year'
  ): Promise<{ date: string; newCustomers: number; totalCustomers: number; cumulativeGrowth: number }[]> {
    // Query customer registration trends
    let dateFormat: string;
    let groupBy: string;

    if (period === 'day') {
      dateFormat = "DATE(account.createdAt)";
      groupBy = "DATE(account.createdAt)";
    } else if (period === 'month') {
      dateFormat = "DATE_FORMAT(account.createdAt, '%Y-%m')";
      groupBy = "DATE_FORMAT(account.createdAt, '%Y-%m')";
    } else {
      dateFormat = "YEAR(account.createdAt)";
      groupBy = "YEAR(account.createdAt)";
    }

    const result = await getRepository(Account)
      .createQueryBuilder("account")
      .leftJoin("account.roles", "role")
      .select([
        `${dateFormat} as date`,
        "COUNT(account.id) as newCustomers"
      ])
      .where("account.createdAt BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      })
      .andWhere("role.name = :roleName", { roleName: "customer" })
      .groupBy(groupBy)
      .orderBy("date", "ASC")
      .getRawMany();

    // Calculate cumulative growth
    let cumulativeTotal = await this.getTotalCustomersBeforeDate(startDate);

    const analytics = result.map(row => {
      const newCustomers = parseInt(row.newCustomers) || 0;
      cumulativeTotal += newCustomers;
      const cumulativeGrowth = cumulativeTotal;

      return {
        date: row.date,
        newCustomers,
        totalCustomers: cumulativeTotal,
        cumulativeGrowth,
      };
    });

    return analytics;
  }

  private async generateTopCustomersBySpending(
    startDate: Date,
    endDate: Date,
    limit: number
  ): Promise<any[]> {
    // Query top customers by total spending
    const result = await getRepository(Order)
      .createQueryBuilder("order")
      .leftJoin("order.customer", "customer")
      .select([
        "customer.id as customerId",
        "customer.name as customerName",
        "customer.email as customerEmail",
        "COUNT(order.id) as totalOrders",
        "SUM(order.totalAmount) as totalSpent",
        "AVG(order.totalAmount) as averageOrderValue",
        "MAX(order.createdAt) as lastOrderDate"
      ])
      .where("order.createdAt BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      })
      .andWhere("order.status != :status", { status: "cancelled" })
      .groupBy("customer.id")
      .orderBy("totalSpent", "DESC")
      .limit(limit)
      .getRawMany();

    return result.map(row => ({
      customerId: row.customerId,
      customerName: row.customerName,
      customerEmail: row.customerEmail,
      totalOrders: parseInt(row.totalOrders) || 0,
      totalSpent: parseFloat(row.totalSpent) || 0,
      averageOrderValue: parseFloat(row.averageOrderValue) || 0,
      lastOrderDate: row.lastOrderDate,
    }));
  }

  private async getTotalCustomersBeforeDate(date: Date): Promise<number> {
    const result = await getRepository(Account)
      .createQueryBuilder("account")
      .leftJoin("account.roles", "role")
      .where("account.createdAt < :date", { date })
      .andWhere("role.name = :roleName", { roleName: "customer" })
      .getCount();

    return result;
  }
}
