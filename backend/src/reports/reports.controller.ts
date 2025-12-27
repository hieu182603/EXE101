import { Body, Controller, Get, Param, Post, QueryParam, Req, UseBefore, Res } from "routing-controllers";
import { Service } from "typedi";
import { ReportsService, ReportFilters } from "./reports.service";
import { Auth } from "@/middlewares/auth.middleware";
import { HttpException } from "@/exceptions/http-exceptions";
import { AccountDetailsDto } from "@/auth/dtos/account.schema";
import { Response } from "express";

@Service()
@Controller("/reports")
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  /**
   * Generate sales report data
   * GET /api/reports/sales?startDate=...&endDate=...&status=...&category=...
   */
  @Get("/sales")
  @UseBefore(Auth)
  async getSalesReport(
    @Req() req: any,
    @QueryParam("startDate") startDateStr?: string,
    @QueryParam("endDate") endDateStr?: string,
    @QueryParam("status") status?: string,
    @QueryParam("category") category?: string
  ) {
    const user = req.user as AccountDetailsDto;

    // Only allow admin, manager, staff
    if (!this.isAdmin(user) && !this.isManager(user) && !this.isStaff(user)) {
      throw new HttpException(401, "Access denied to sales reports");
    }

    try {
      const filters: ReportFilters = {};

      if (startDateStr) filters.startDate = new Date(startDateStr);
      if (endDateStr) filters.endDate = new Date(endDateStr);
      if (status) filters.status = status;
      if (category) filters.category = category;

      const reportData = await this.reportsService.generateSalesReport(filters);

      return {
        success: true,
        message: "Sales report generated successfully",
        data: reportData
      };
    } catch (error: any) {
      console.error("Error generating sales report:", error);
      throw new HttpException(500, error?.message || "Failed to generate sales report");
    }
  }

  /**
   * Export sales report to Excel
   * GET /api/reports/sales/export?startDate=...&endDate=...&format=excel
   */
  @Get("/sales/export")
  @UseBefore(Auth)
  async exportSalesReport(
    @Req() req: any,
    @Res() res: Response,
    @QueryParam("startDate") startDateStr?: string,
    @QueryParam("endDate") endDateStr?: string,
    @QueryParam("format") format: string = "excel"
  ) {
    const user = req.user as AccountDetailsDto;

    // Only allow admin, manager, staff
    if (!this.isAdmin(user) && !this.isManager(user) && !this.isStaff(user)) {
      return res.status(403).json({
        success: false,
        message: "Access denied to sales reports"
      });
    }

    try {
      const filters: ReportFilters = {};

      if (startDateStr) filters.startDate = new Date(startDateStr);
      if (endDateStr) filters.endDate = new Date(endDateStr);

      if (format === "excel") {
        const buffer = await this.reportsService.exportSalesReportToExcel(filters);

        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `sales_report_${timestamp}.xlsx`;

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', (buffer as Buffer).length);

        res.send(buffer);
      } else {
        return res.status(400).json({
          success: false,
          message: "Unsupported export format. Use 'excel'"
        });
      }
    } catch (error: any) {
      console.error("Error exporting sales report:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to export sales report",
        error: error.message
      });
    }
  }

  /**
   * Generate inventory report data
   * GET /api/reports/inventory
   */
  @Get("/inventory")
  @UseBefore(Auth)
  async getInventoryReport(@Req() req: any) {
    const user = req.user as AccountDetailsDto;

    // Only allow admin, manager, staff
    if (!this.isAdmin(user) && !this.isManager(user) && !this.isStaff(user)) {
      throw new HttpException(401, "Access denied to inventory reports");
    }

    try {
      const reportData = await this.reportsService.generateInventoryReport();

      return {
        success: true,
        message: "Inventory report generated successfully",
        data: reportData
      };
    } catch (error: any) {
      console.error("Error generating inventory report:", error);
      throw new HttpException(500, error?.message || "Failed to generate inventory report");
    }
  }

  /**
   * Export inventory report to Excel
   * GET /api/reports/inventory/export?format=excel
   */
  @Get("/inventory/export")
  @UseBefore(Auth)
  async exportInventoryReport(
    @Req() req: any,
    @Res() res: Response,
    @QueryParam("format") format: string = "excel"
  ) {
    const user = req.user as AccountDetailsDto;

    // Only allow admin, manager, staff
    if (!this.isAdmin(user) && !this.isManager(user) && !this.isStaff(user)) {
      return res.status(403).json({
        success: false,
        message: "Access denied to inventory reports"
      });
    }

    try {
      if (format === "excel") {
        const buffer = await this.reportsService.exportInventoryReportToExcel();

        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `inventory_report_${timestamp}.xlsx`;

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', (buffer as Buffer).length);

        res.send(buffer);
      } else {
        return res.status(400).json({
          success: false,
          message: "Unsupported export format. Use 'excel'"
        });
      }
    } catch (error: any) {
      console.error("Error exporting inventory report:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to export inventory report",
        error: error.message
      });
    }
  }

  /**
   * Generate customer report data
   * GET /api/reports/customers?startDate=...&endDate=...
   */
  @Get("/customers")
  @UseBefore(Auth)
  async getCustomerReport(
    @Req() req: any,
    @QueryParam("startDate") startDateStr?: string,
    @QueryParam("endDate") endDateStr?: string
  ) {
    const user = req.user as AccountDetailsDto;

    // Only allow admin, manager, staff
    if (!this.isAdmin(user) && !this.isManager(user) && !this.isStaff(user)) {
      throw new HttpException(401, "Access denied to customer reports");
    }

    try {
      const filters: ReportFilters = {};

      if (startDateStr) filters.startDate = new Date(startDateStr);
      if (endDateStr) filters.endDate = new Date(endDateStr);

      const reportData = await this.reportsService.generateCustomerReport(filters);

      return {
        success: true,
        message: "Customer report generated successfully",
        data: reportData
      };
    } catch (error: any) {
      console.error("Error generating customer report:", error);
      throw new HttpException(500, error?.message || "Failed to generate customer report");
    }
  }

  /**
   * Export customer report to Excel
   * GET /api/reports/customers/export?startDate=...&endDate=...&format=excel
   */
  @Get("/customers/export")
  @UseBefore(Auth)
  async exportCustomerReport(
    @Req() req: any,
    @Res() res: Response,
    @QueryParam("startDate") startDateStr?: string,
    @QueryParam("endDate") endDateStr?: string,
    @QueryParam("format") format: string = "excel"
  ) {
    const user = req.user as AccountDetailsDto;

    // Only allow admin, manager, staff
    if (!this.isAdmin(user) && !this.isManager(user) && !this.isStaff(user)) {
      return res.status(403).json({
        success: false,
        message: "Access denied to customer reports"
      });
    }

    try {
      const filters: ReportFilters = {};

      if (startDateStr) filters.startDate = new Date(startDateStr);
      if (endDateStr) filters.endDate = new Date(endDateStr);

      if (format === "excel") {
        const buffer = await this.reportsService.exportCustomerReportToExcel(filters);

        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `customer_report_${timestamp}.xlsx`;

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', (buffer as Buffer).length);

        res.send(buffer);
      } else {
        return res.status(400).json({
          success: false,
          message: "Unsupported export format. Use 'excel'"
        });
      }
    } catch (error: any) {
      console.error("Error exporting customer report:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to export customer report",
        error: error.message
      });
    }
  }

  /**
   * Generate shipper report data
   * GET /api/reports/shippers?startDate=...&endDate=...
   */
  @Get("/shippers")
  @UseBefore(Auth)
  async getShipperReport(
    @Req() req: any,
    @QueryParam("startDate") startDateStr?: string,
    @QueryParam("endDate") endDateStr?: string,
    @QueryParam("shipperId") shipperId?: string
  ) {
    const user = req.user as AccountDetailsDto;

    // Only allow admin, manager, staff
    if (!this.isAdmin(user) && !this.isManager(user) && !this.isStaff(user)) {
      throw new HttpException(401, "Access denied to shipper reports");
    }

    try {
      const filters: ReportFilters = {};

      if (startDateStr) filters.startDate = new Date(startDateStr);
      if (endDateStr) filters.endDate = new Date(endDateStr);
      if (shipperId) filters.shipperId = shipperId;

      const reportData = await this.reportsService.generateShipperReport(filters);

      return {
        success: true,
        message: "Shipper report generated successfully",
        data: reportData
      };
    } catch (error: any) {
      console.error("Error generating shipper report:", error);
      throw new HttpException(500, error?.message || "Failed to generate shipper report");
    }
  }

  /**
   * Get all available reports summary
   * GET /api/reports/summary
   */
  @Get("/summary")
  @UseBefore(Auth)
  async getReportsSummary(@Req() req: any) {
    const user = req.user as AccountDetailsDto;

    // Only allow admin, manager, staff
    if (!this.isAdmin(user) && !this.isManager(user) && !this.isStaff(user)) {
      throw new HttpException(401, "Access denied to reports summary");
    }

    try {
      const availableReports = [
        {
          id: "sales",
          name: "Sales Report",
          description: "Comprehensive sales analysis with revenue, orders, and product performance",
          exportFormats: ["excel"],
          filters: ["dateRange", "status", "category"]
        },
        {
          id: "inventory",
          name: "Inventory Report",
          description: "Stock levels, low stock alerts, and inventory valuation",
          exportFormats: ["excel"],
          filters: []
        },
        {
          id: "customers",
          name: "Customer Report",
          description: "Customer analysis, top spenders, and retention metrics",
          exportFormats: ["excel"],
          filters: ["dateRange"]
        },
        {
          id: "shippers",
          name: "Shipper Report",
          description: "Shipper performance, delivery rates, and efficiency metrics",
          exportFormats: ["excel"],
          filters: ["dateRange", "shipperId"]
        }
      ];

      return {
        success: true,
        message: "Reports summary retrieved successfully",
        data: {
          totalReports: availableReports.length,
          availableReports
        }
      };
    } catch (error: any) {
      console.error("Error getting reports summary:", error);
      throw new HttpException(500, error?.message || "Failed to get reports summary");
    }
  }

  // Helper methods
  private isAdmin(user: AccountDetailsDto): boolean {
    return user.role?.name?.toLowerCase().includes('admin') || false;
  }

  private isManager(user: AccountDetailsDto): boolean {
    return user.role?.name?.toLowerCase().includes('manager') || false;
  }

  private isStaff(user: AccountDetailsDto): boolean {
    return user.role?.name?.toLowerCase().includes('staff') || false;
  }
}
