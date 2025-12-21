import { Body, Controller, Delete, Get, Param, Post, Put, QueryParam, UseBefore } from "routing-controllers";
import { Service } from "typedi";
import { ShipperService } from "./shipper.services";
import { CreateShipperDto, UpdateShipperDto } from "./dtos/shipper.dtos";
import { OrderService } from "../order/order.service";
import { Auth } from "../middlewares/auth.middleware";

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
      return {
        success: false,
        message: "Failed to create shipper",
        error: error.message || "Unknown error"
      };
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
      return {
        success: false,
        message: "Failed to retrieve shippers",
        error: error.message || "Unknown error"
      };
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
      return {
        success: false,
        message: "Failed to retrieve available shippers",
        error: error.message || "Unknown error"
      };
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
          maxDailyOrders: shipper.maxOrdersPerDay || 10,
          isAvailable: shipper.isAvailable,
          priority: shipper.priority || 1
        },
        message: "Statistics retrieved successfully"
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to retrieve statistics",
        error: error.message || "Unknown error"
      };
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
      return {
        success: false,
        message: "Failed to retrieve shipper",
        error: error.message || "Unknown error"
      };
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
      return {
        success: false,
        message: "Failed to update shipper",
        error: error.message || "Unknown error"
      };
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
      return {
        success: false,
        message: "Failed to delete shipper",
        error: error.message || "Unknown error"
      };
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
      throw error; // Let error handler deal with it
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
      return {
        success: false,
        message: "Failed to update order status",
        error: error.message || "Unknown error"
      };
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
      return {
        success: false,
        message: "Failed to confirm order",
        error: error.message || "Unknown error"
      };
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
      return {
        success: false,
        message: "Failed to export shippers",
        error: error.message || "Unknown error"
      };
    }
  }
}
