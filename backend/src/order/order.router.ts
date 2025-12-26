import { Router } from "express";
import { Container } from "typedi";
import { OrderController } from "./order.controller";
import { Auth } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validation.middleware";
import { CreateOrderSchema, UpdateOrderSchema } from "./dtos/order.schema";

const router = Router();
const orderController = Container.get(OrderController);

router.post("/orders", validate(CreateOrderSchema), async (req, res, next) => {
  try {
    const result = await orderController.createOrder(req, req.body);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.get("/orders", Auth as any, async (req: any, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 1000;
    const result = await orderController.getOrders(req, page, limit);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.get("/orders/statistics", Auth as any, async (req: any, res, next) => {
  try {
    const result = await orderController.getStatistics(req);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.get("/orders/admin", Auth as any, async (req: any, res, next) => {
  try {
    const result = await orderController.getAllOrdersForAdmin(
      req,
      req.query.status as string,
      req.query.search as string,
      req.query.sort as string,
      parseInt(req.query.page as string) || 1,
      parseInt(req.query.limit as string) || 10,
      req.query.shipper as string,
      req.query.assigned === 'true',
      req.query.unassigned === 'true'
    );
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.get("/orders/:id", Auth as any, async (req: any, res, next) => {
  try {
    const result = await orderController.getOrder(req.params.id, req);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.patch("/orders/:id/status", Auth as any, validate(UpdateOrderSchema), async (req: any, res, next) => {
  try {
    const result = await orderController.updateOrderStatus(req.params.id, req.body, req);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.delete("/orders/:id", Auth as any, async (req: any, res, next) => {
  try {
    const result = await orderController.deleteOrder(req.params.id, req);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.post("/orders/:id/confirm-delivery", Auth as any, async (req: any, res, next) => {
  try {
    const result = await orderController.confirmOrderDelivery(req.params.id, req);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

/**
 * GET /api/orders/dashboard/stats
 * Dashboard overview statistics
 */
router.get("/orders/dashboard/stats", Auth as any, async (req: any, res, next) => {
  try {
    const result = await orderController.getDashboardStats(req);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

export default router;

