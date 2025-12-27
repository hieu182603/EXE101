import { Body, Controller, Delete, Get, Param, Post, Put, QueryParam, Req, UseBefore } from "routing-controllers";
import { Service } from "typedi";
import { CustomerService } from "./customer.service";
import { CreateCustomerDto, UpdateCustomerDto } from "./dtos/customer.dtos";
import { Auth } from "@/middlewares/auth.middleware";
import { DbConnection } from "@/database/dbConnection";
import { Account } from "@/auth/account/account.entity";
import { Order } from "@/order/order.entity";
import { AccountDetailsDto } from "@/auth/dtos/account.schema";
import { HttpException } from "@/exceptions/http-exceptions";

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
      throw new HttpException(500, error?.message || "Failed to create customer");
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
      throw new HttpException(500, error?.message || "Failed to retrieve customers");
    }
  }

  @Get("/search")
  async searchCustomers(@QueryParam("q") searchTerm: string) {
    try {
      if (!searchTerm) {
        throw new HttpException(400, "Search term is required");
      }
      const customers = await this.customerService.searchCustomers(searchTerm);
      return {
        success: true,
        data: customers,
        message: "Customers found successfully"
      };
    } catch (error: any) {
      throw new HttpException(500, error?.message || "Failed to search customers");
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
      throw new HttpException(500, error?.message || "Failed to retrieve customer");
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
      throw new HttpException(500, error?.message || "Failed to update customer");
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
      throw new HttpException(500, error?.message || "Failed to delete customer");
    }
  }

  @Get("/export")
  async exportCustomers() {
    try {
      const ExcelJS = require('exceljs');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Customers');

      // Add headers
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 36 },
        { header: 'Username', key: 'username', width: 20 },
        { header: 'Full Name', key: 'name', width: 30 },
        { header: 'Phone', key: 'phone', width: 15 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Created At', key: 'createdAt', width: 20 }
      ];

      // Fetch customers
      const customers = await this.customerService.getAllCustomers();

      // Add rows
      worksheet.addRows(customers);

      // Generate buffer
      const buffer = await workbook.xlsx.writeBuffer();

      return {
        success: true,
        data: buffer,
        message: 'Export successful',
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename=customers-${Date.now()}.xlsx`
        }
      };
    } catch (error: any) {
      throw new HttpException(500, error?.message || "Failed to export customers");
    }
  }

  @Post("/import")
  async importCustomers() {
    try {
      // Currently import is not implemented on backend.
      // Return a helpful response so frontend doesn't fail.
      return {
        success: false,
        message: "Import customers endpoint is not implemented on the server yet."
      };
    } catch (error: any) {
      throw new HttpException(500, error?.message || "Failed to import customers");
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
      throw new HttpException(401, "Access denied to customer analytics");
    }

    try {
      if (!startDateStr || !endDateStr) {
        throw new HttpException(400, "startDate and endDate are required");
      }

      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new HttpException(400, "Invalid date format");
      }

      const analytics = await this.generateCustomerGrowthAnalytics(startDate, endDate, period);

      return {
        success: true,
        message: "Customer growth analytics retrieved successfully",
        data: analytics
      };
    } catch (error: any) {
      console.error("Error getting customer growth analytics:", error);
      throw new HttpException(500, error?.message || "Failed to retrieve customer growth analytics");
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
      throw new HttpException(401, "Access denied to customer analytics");
    }

    try {
      if (!startDateStr || !endDateStr) {
        throw new HttpException(400, "startDate and endDate are required");
      }

      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new HttpException(400, "Invalid date format");
      }

      const topCustomers = await this.generateTopCustomersBySpending(startDate, endDate, limit);

      return {
        success: true,
        message: "Top customers by spending retrieved successfully",
        data: topCustomers
      };
    } catch (error: any) {
      console.error("Error getting top customers by spending:", error);
      throw new HttpException(500, error?.message || "Failed to retrieve top customers by spending");
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
      dateFormat = "TO_CHAR(account.createdAt, 'YYYY-MM')";
      groupBy = "TO_CHAR(account.createdAt, 'YYYY-MM')";
    } else {
      dateFormat = "EXTRACT(YEAR FROM account.createdAt)";
      groupBy = "EXTRACT(YEAR FROM account.createdAt)";
    }

    const result = await DbConnection.appDataSource.getRepository(Account)
      .createQueryBuilder("account")
      .leftJoin("account.role", "role")
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
    const result = await DbConnection.appDataSource.getRepository(Order)
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
    const result = await DbConnection.appDataSource.getRepository(Account)
      .createQueryBuilder("account")
      .leftJoin("account.role", "role")
      .where("account.createdAt < :date", { date })
      .andWhere("role.name = :roleName", { roleName: "customer" })
      .getCount();

    return result;
  }
}
