import { Router } from "express";
import { Container } from "typedi";
import { ReportsController } from "./reports.controller";
import { Auth } from "@/middlewares/auth.middleware";

const router = Router();
const reportsController = Container.get(ReportsController);

/**
 * GET /api/reports/summary
 * Get available reports summary
 */
router.get("/reports/summary", Auth as any, async (req: any, res, next) => {
  try {
    const result = await reportsController.getReportsSummary(req);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

/**
 * GET /api/reports/sales
 * Generate sales report data
 */
router.get("/reports/sales", Auth as any, async (req: any, res, next) => {
  try {
    const result = await reportsController.getSalesReport(
      req,
      req.query.startDate as string,
      req.query.endDate as string,
      req.query.status as string,
      req.query.category as string
    );
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

/**
 * GET /api/reports/sales/export
 * Export sales report to Excel
 */
router.get("/reports/sales/export", Auth as any, async (req: any, res, next) => {
  try {
    await reportsController.exportSalesReport(req, res, req.query.startDate as string, req.query.endDate as string, req.query.format as string);
  } catch (error: any) {
    next(error);
  }
});

/**
 * GET /api/reports/inventory
 * Generate inventory report data
 */
router.get("/reports/inventory", Auth as any, async (req: any, res, next) => {
  try {
    const result = await reportsController.getInventoryReport(req);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

/**
 * GET /api/reports/inventory/export
 * Export inventory report to Excel
 */
router.get("/reports/inventory/export", Auth as any, async (req: any, res, next) => {
  try {
    await reportsController.exportInventoryReport(req, res, req.query.format as string);
  } catch (error: any) {
    next(error);
  }
});

/**
 * GET /api/reports/customers
 * Generate customer report data
 */
router.get("/reports/customers", Auth as any, async (req: any, res, next) => {
  try {
    const result = await reportsController.getCustomerReport(req, req.query.startDate as string, req.query.endDate as string);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

/**
 * GET /api/reports/customers/export
 * Export customer report to Excel
 */
router.get("/reports/customers/export", Auth as any, async (req: any, res, next) => {
  try {
    await reportsController.exportCustomerReport(req, res, req.query.startDate as string, req.query.endDate as string, req.query.format as string);
  } catch (error: any) {
    next(error);
  }
});

/**
 * GET /api/reports/shippers
 * Generate shipper report data
 */
router.get("/reports/shippers", Auth as any, async (req: any, res, next) => {
  try {
    const result = await reportsController.getShipperReport(req, req.query.startDate as string, req.query.endDate as string, req.query.shipperId as string);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

export default router;


