import { Body, Controller, Delete, Get, Param, Post, Put, QueryParam, UseBefore, Req } from "routing-controllers";
import { Service } from "typedi";
import { ShipperService } from "./shipper.services";
import { CreateShipperDto, UpdateShipperDto } from "./dtos/shipper.dtos";
import { OrderService } from "../order/order.service";
import { Auth } from "../middlewares/auth.middleware";
import { Order } from "../order/order.entity";
import { AccountDetailsDto } from "../auth/dtos/account.schema";
import { DbConnection } from "@/database/dbConnection";
import { HttpException } from "@/exceptions/http-exceptions";

@Service()
@Controller("/shippers")
export class ShipperController {
  constructor(
    private readonly shipperService: ShipperService,
    private readonly orderService: OrderService
  ) {}

  @Post("/")
  async createShipper(@Body() createShipperDto: CreateShipperDto) {
    try {
      const shipper = await this.shipperService.createShipper(createShipperDto);
      return {
        success: true,
        data: shipper,
        message: "Shipper created successfully"
      };
    } catch (error: any) {
      throw new HttpException(500, error?.message || "Failed to create shipper");
    }
  }

  @Get()
  async getAllShippers() {
    try {
      const shippers = await this.shipperService.getAllShippers();
      return {
        success: true,
        data: shippers,
        message: "Shippers retrieved successfully"
      };
    } catch (error: any) {
      throw new HttpException(500, error?.message || "Failed to retrieve shippers");
    }
  }

  @Get("/available")
  async getAvailableShippers() {
    try {
      const shippers = await this.shipperService.getAvailableShippers();
      return {
        success: true,
        data: shippers,
        message: "Available shippers retrieved successfully"
      };
    } catch (error: any) {
      throw new HttpException(500, error?.message || "Failed to retrieve available shippers");
    }
  }

  @Get("/:id/statistics")
  async getShipperStatistics(@Param("id") id: string) {
    try {
      const shipper = await this.shipperService.getShipperById(id);
      
      // Calculate real statistics
      const totalOrders = shipper.shipperOrders?.length || 0;
      const deliveredOrders = shipper.shipperOrders?.filter((order: any) => order.status === 'DELIVERED').length || 0;
      const activeOrders = shipper.shipperOrders?.filter((order: any) => 
        ['SHIPPING', 'PENDING'].includes(order.status)
      ).length || 0;
      const cancelledOrders = shipper.shipperOrders?.filter((order: any) => order.status === 'CANCELLED').length || 0;
      
      // Calculate performance metrics
      const deliveryRate = totalOrders > 0 ? ((deliveredOrders / totalOrders) * 100).toFixed(1) : "0";
      const cancellationRate = totalOrders > 0 ? ((cancelledOrders / totalOrders) * 100).toFixed(1) : "0";
      
      // Calculate rating from performance (simple algorithm)
      let rating = "5.0";
      if (totalOrders > 0) {
        const successRate = deliveredOrders / totalOrders;
        rating = (successRate * 5).toFixed(1);
      }
      
      // Get today's orders
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayOrders = shipper.shipperOrders?.filter((order: any) => {
        const orderDate = new Date(order.orderDate);
        return orderDate >= today;
      }).length || 0;
      
      return {
        success: true,
        data: {
          totalOrders,
          deliveredOrders,
          activeOrders,
          cancelledOrders,
          deliveryRate: parseFloat(deliveryRate),
          cancellationRate: parseFloat(cancellationRate),
          rating: parseFloat(rating),
          todayOrders,
          maxDailyOrders: shipper.shipperProfile?.maxOrdersPerDay || 10,
          isAvailable: shipper.shipperProfile?.isAvailable,
          priority: shipper.shipperProfile?.priority || 1
        },
        message: "Statistics retrieved successfully"
      };
    } catch (error: any) {
      throw new HttpException(500, error?.message || "Failed to retrieve statistics");
    }
  }

  @Get("/:id")
  async getShipperById(@Param("id") id: string) {
    try {
      const shipper = await this.shipperService.getShipperById(id);
      return {
        success: true,
        data: shipper,
        message: "Shipper retrieved successfully"
      };
    } catch (error: any) {
      throw new HttpException(500, error?.message || "Failed to retrieve shipper");
    }
  }

  @Put("/:id")
  async updateShipper(
    @Param("id") id: string,
    @Body() updateShipperDto: UpdateShipperDto
  ) {
    try {
      const shipper = await this.shipperService.updateShipper(id, updateShipperDto);
      return {
        success: true,
        data: shipper,
        message: "Shipper updated successfully"
      };
    } catch (error: any) {
      throw new HttpException(500, error?.message || "Failed to update shipper");
    }
  }

  @Delete("/:id")
  async deleteShipper(@Param("id") id: string) {
    try {
      await this.shipperService.deleteShipper(id);
      return {
        success: true,
        message: "Shipper deleted successfully"
      };
    } catch (error: any) {
      throw new HttpException(500, error?.message || "Failed to delete shipper");
    }
  }

  @Get("/:id/orders")
  @UseBefore(Auth)
  async getOrdersByShipper(
    @Param("id") shipperId: string,
    @QueryParam("status") status: string,
    @QueryParam("search") search: string,
    @QueryParam("sort") sort: string,
    @QueryParam("page") page: number = 1,
    @QueryParam("limit") limit: number = 10
  ) {
    try {
      // Validate pagination parameters
      if (page < 1) page = 1;
      if (limit < 1 || limit > 100) limit = 10;

      const result = await this.orderService.getOrdersByShipperId(
        shipperId, 
        { status, search, sort, page, limit }
      );
      
      // ✅ FIX: Return direct structure to avoid double-wrapping
      return {
        data: result.orders,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit)
        },
        message: "Orders retrieved successfully"
      };
    } catch (error: any) {
      throw new HttpException(500, error?.message || "Failed to retrieve orders for shipper");
    }
  }

  @Put("/:shipperId/orders/:orderId/status")
  @UseBefore(Auth)
  async updateOrderStatusByShipper(
    @Param("shipperId") shipperId: string,
    @Param("orderId") orderId: string,
    @Body() updateData: { status: string; reason?: string }
  ) {
    try {
      const order = await this.orderService.updateOrderStatusByShipper(
        orderId,
        shipperId,
        updateData
      );
      
      return {
        success: true,
        data: order,
        message: "Order status updated successfully"
      };
    } catch (error: any) {
      throw new HttpException(500, error?.message || "Failed to update order status");
    }
  }

  @Put("/:shipperId/orders/:orderId/confirm")
  @UseBefore(Auth)
  async confirmOrderByShipper(
    @Param("shipperId") shipperId: string,
    @Param("orderId") orderId: string
  ) {
    try {
      // Gọi service với status CONFIRMED đã xác định
      const order = await this.orderService.updateOrderStatusByShipper(
        orderId,
        shipperId,
        { status: 'CONFIRMED' }
      );
      
      return {
        success: true,
        data: order,
        message: "Order confirmed successfully"
      };
    } catch (error: any) {
      throw new HttpException(500, error?.message || "Failed to confirm order");
    }
  }

  @Get("/export")
  async exportShippers() {
    try {
      const shippers = await this.shipperService.getAllShippers();
      
      // Enhanced CSV export with proper formatting
      const csvHeader = "ID,Full Name,Username,Phone,Status,Registration Status,Available,Priority,Working Zones,Total Orders,Delivered Orders,Daily Orders,Max Daily Orders,Created Date\n";
      
      const csvRows = shippers.map(shipper => {
        const workingZones = (shipper.workingZones || []).join(';');
        const status = shipper.isRegistered ? 'Active' : 'Inactive';
        const available = shipper.isAvailable ? 'Yes' : 'No';
        const registered = shipper.isRegistered ? 'Yes' : 'No';
        const createdDate = new Date(shipper.createdAt).toLocaleDateString('vi-VN');
        
        // Calculate statistics if not provided
        const totalOrders = shipper.shipperOrders?.length || 0;
        const deliveredOrders = shipper.shipperOrders?.filter((order: any) => order.status === 'DELIVERED').length || 0;
        
        // Escape commas and quotes in data
        const escapeCsv = (str: any) => {
          if (typeof str !== 'string') return str;
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        };
        
        return [
          escapeCsv(shipper.id),
          escapeCsv(shipper.fullName || shipper.name || ''),
          escapeCsv(shipper.username || ''),
          escapeCsv(shipper.phone || ''),
          escapeCsv(status),
          escapeCsv(registered),
          escapeCsv(available),
          shipper.priority || 1,
          escapeCsv(workingZones),
          totalOrders,
          deliveredOrders,
          shipper.dailyOrderCount || shipper.currentOrdersToday || 0,
          shipper.maxDailyOrders || shipper.maxOrdersPerDay || 10,
          escapeCsv(createdDate)
        ].join(',');
      }).join('\n');
      
      const csvContent = csvHeader + csvRows;
      const timestamp = new Date().toISOString().split('T')[0];
      
      return {
        success: true,
        data: csvContent,
        message: "Export successful",
        meta: {
          filename: `shippers_export_${timestamp}.csv`,
          totalRecords: shippers.length,
          exportDate: new Date().toISOString()
        }
      };
    } catch (error: any) {
      throw new HttpException(500, error?.message || "Failed to export shippers");
    }
  }

  /**
   * Get shipper performance analytics
   * GET /api/shippers/analytics/performance?startDate=...&endDate=...&limit=10
   */
  @Get("/analytics/performance")
  @UseBefore(Auth)
  async getShipperPerformanceAnalytics(
    @Req() req: any,
    @QueryParam("startDate") startDateStr: string,
    @QueryParam("endDate") endDateStr: string,
    @QueryParam("limit") limit: number = 10
  ) {
    const user = req.user as AccountDetailsDto;

    // Only allow admin, manager, staff
    if (!this.isAdmin(user) && !this.isManager(user) && !this.isStaff(user)) {
      throw new HttpException(401, "Access denied to shipper analytics");
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

      const analytics = await this.generateShipperPerformanceAnalytics(startDate, endDate, limit);

      return {
        success: true,
        message: "Shipper performance analytics retrieved successfully",
        data: analytics
      };
    } catch (error: any) {
      console.error("Error getting shipper performance analytics:", error);
      throw new HttpException(500, error?.message || "Failed to retrieve shipper performance analytics");
    }
  }

  /**
   * Get shipper delivery trends over time
   * GET /api/shippers/analytics/delivery-trends?startDate=...&endDate=...&period=month
   */
  @Get("/analytics/delivery-trends")
  @UseBefore(Auth)
  async getShipperDeliveryTrends(
    @Req() req: any,
    @QueryParam("startDate") startDateStr: string,
    @QueryParam("endDate") endDateStr: string,
    @QueryParam("period") period: 'day' | 'month' | 'year' = 'month'
  ) {
    const user = req.user as AccountDetailsDto;

    // Only allow admin, manager, staff
    if (!this.isAdmin(user) && !this.isManager(user) && !this.isStaff(user)) {
      throw new HttpException(401, "Access denied to shipper delivery trends");
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

      const trends = await this.generateShipperDeliveryTrends(startDate, endDate, period);

      return {
        success: true,
        message: "Shipper delivery trends retrieved successfully",
        data: trends
      };
    } catch (error: any) {
      console.error("Error getting shipper delivery trends:", error);
      return {
        success: false,
        message: "Failed to retrieve shipper delivery trends",
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

  private async generateShipperPerformanceAnalytics(
    startDate: Date,
    endDate: Date,
    limit: number
  ): Promise<any[]> {
    // Query shipper performance based on delivered orders
    const result = await DbConnection.appDataSource.getRepository(Order)
      .createQueryBuilder("order")
      .leftJoin("order.shipper", "shipper")
      .select([
        "shipper.id as shipperId",
        "shipper.name as shipperName",
        "shipper.phone as shipperPhone",
        "COUNT(order.id) as totalOrders",
        "COUNT(CASE WHEN order.status = 'delivered' THEN 1 END) as deliveredOrders",
        "COUNT(CASE WHEN order.status = 'shipped' THEN 1 END) as shippedOrders",
        "SUM(order.totalAmount) as totalRevenue",
        "AVG(order.totalAmount) as averageOrderValue",
        "MIN(order.createdAt) as firstDeliveryDate",
        "MAX(order.createdAt) as lastDeliveryDate"
      ])
      .where("order.createdAt BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      })
      .andWhere("order.shipperId IS NOT NULL")
      .groupBy("shipper.id")
      .orderBy("totalOrders", "DESC")
      .limit(limit)
      .getRawMany();

    return result.map(row => {
      const totalOrders = parseInt(row.totalOrders) || 0;
      const deliveredOrders = parseInt(row.deliveredOrders) || 0;
      const deliveryRate = totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0;

      return {
        shipperId: row.shipperId,
        shipperName: row.shipperName,
        shipperPhone: row.shipperPhone,
        totalOrders,
        deliveredOrders,
        shippedOrders: parseInt(row.shippedOrders) || 0,
        deliveryRate: Math.round(deliveryRate * 100) / 100, // Round to 2 decimal places
        totalRevenue: parseFloat(row.totalRevenue) || 0,
        averageOrderValue: parseFloat(row.averageOrderValue) || 0,
        firstDeliveryDate: row.firstDeliveryDate,
        lastDeliveryDate: row.lastDeliveryDate,
        performanceScore: this.calculateShipperPerformanceScore(row),
      };
    });
  }

  private async generateShipperDeliveryTrends(
    startDate: Date,
    endDate: Date,
    period: 'day' | 'month' | 'year'
  ): Promise<{ date: string; totalOrders: number; deliveredOrders: number; deliveryRate: number }[]> {
    // Query shipper delivery trends
    let dateFormat: string;
    let groupBy: string;

    if (period === 'day') {
      dateFormat = "DATE(order.createdAt)";
      groupBy = "DATE(order.createdAt)";
    } else if (period === 'month') {
      dateFormat = "TO_CHAR(order.createdAt, 'YYYY-MM')";
      groupBy = "TO_CHAR(order.createdAt, 'YYYY-MM')";
    } else {
      dateFormat = "EXTRACT(YEAR FROM order.createdAt)";
      groupBy = "EXTRACT(YEAR FROM order.createdAt)";
    }

    const result = await DbConnection.appDataSource.getRepository(Order)
      .createQueryBuilder("order")
      .select([
        `${dateFormat} as date`,
        "COUNT(order.id) as totalOrders",
        "COUNT(CASE WHEN order.status = 'delivered' THEN 1 END) as deliveredOrders"
      ])
      .where("order.createdAt BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      })
      .andWhere("order.shipperId IS NOT NULL")
      .groupBy(groupBy)
      .orderBy("date", "ASC")
      .getRawMany();

    return result.map(row => {
      const totalOrders = parseInt(row.totalOrders) || 0;
      const deliveredOrders = parseInt(row.deliveredOrders) || 0;
      const deliveryRate = totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0;

      return {
        date: row.date,
        totalOrders,
        deliveredOrders,
        deliveryRate: Math.round(deliveryRate * 100) / 100,
      };
    });
  }

  private calculateShipperPerformanceScore(row: any): number {
    const totalOrders = parseInt(row.totalOrders) || 0;
    const deliveredOrders = parseInt(row.deliveredOrders) || 0;
    const deliveryRate = totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0;
    const totalRevenue = parseFloat(row.totalRevenue) || 0;

    // Performance score calculation
    // Weight: 50% delivery rate, 30% total orders, 20% revenue
    const deliveryScore = Math.min(deliveryRate / 100, 1) * 50; // Max score for 100% delivery rate
    const orderScore = Math.min(totalOrders / 50, 1) * 30; // Max score for 50+ orders
    const revenueScore = Math.min(totalRevenue / 50000, 1) * 20; // Max score for $50k+ revenue

    return Math.round(deliveryScore + orderScore + revenueScore);
  }
}
