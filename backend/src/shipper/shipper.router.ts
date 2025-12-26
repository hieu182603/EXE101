import { Router } from "express";
import { Container } from "typedi";
import { ShipperController } from "./shipper.controller";
import { OrderAssignmentController } from "./orderAssignment.controller";
import { Auth, Admin } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validation.middleware";
import { CreateShipperSchema, UpdateShipperSchema } from "./dtos/shipper.schema";

const router = Router();
const shipperController = Container.get(ShipperController);
const orderAssignmentController = Container.get(OrderAssignmentController);

// Shipper routes
router.post("/shippers", validate(CreateShipperSchema), async (req, res, next) => {
  try {
    const result = await shipperController.createShipper(req.body);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.get("/shippers", async (req, res, next) => {
  try {
    const result = await shipperController.getAllShippers();
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.get("/shippers/available", async (req, res, next) => {
  try {
    const result = await shipperController.getAvailableShippers();
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.get("/shippers/:id/statistics", async (req, res, next) => {
  try {
    const result = await shipperController.getShipperStatistics(req.params.id);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.get("/shippers/:id", async (req, res, next) => {
  try {
    const result = await shipperController.getShipperById(req.params.id);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.put("/shippers/:id", validate(UpdateShipperSchema), async (req, res, next) => {
  try {
    const result = await shipperController.updateShipper(req.params.id, req.body);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.delete("/shippers/:id", async (req, res, next) => {
  try {
    const result = await shipperController.deleteShipper(req.params.id);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.get("/shippers/:id/orders", Auth as any, async (req: any, res, next) => {
  try {
    const result = await shipperController.getOrdersByShipper(
      req.params.id,
      req.query.status as string,
      req.query.search as string,
      req.query.sort as string,
      parseInt(req.query.page as string) || 1,
      parseInt(req.query.limit as string) || 10
    );
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.put("/shippers/:shipperId/orders/:orderId/status", Auth as any, async (req: any, res, next) => {
  try {
    const result = await shipperController.updateOrderStatusByShipper(
      req.params.shipperId,
      req.params.orderId,
      req.body
    );
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.put("/shippers/:shipperId/orders/:orderId/confirm", Auth as any, async (req: any, res, next) => {
  try {
    const result = await shipperController.confirmOrderByShipper(
      req.params.shipperId,
      req.params.orderId
    );
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.get("/shippers/export", async (req, res, next) => {
  try {
    const result = await shipperController.exportShippers();
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

// Backwards-compatible shipping routes used by older frontend paths
router.put("/shipping/shippers/:shipperId/availability", async (req: any, res, next) => {
  try {
    // Map to existing updateShipper endpoint (only update availability)
    const updateBody = { isAvailable: req.body.isAvailable };
    const result = await shipperController.updateShipper(req.params.shipperId, updateBody);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.put("/shipping/shippers/:shipperId/priority", async (req: any, res, next) => {
  try {
    // Map to existing updateShipper endpoint (only update priority)
    const updateBody = { priority: req.body.priority };
    const result = await shipperController.updateShipper(req.params.shipperId, updateBody);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

// Order Assignment routes
router.post("/api/order-assignment/run-assignment/:orderId", Admin as any, async (req: any, res, next) => {
  try {
    const result = await orderAssignmentController.runAssignment(req.params.orderId, req.body);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.get("/api/order-assignment/shipper-zones/:shipperId", Auth as any, async (req: any, res, next) => {
  try {
    const result = await orderAssignmentController.getShipperZones(req.params.shipperId);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.get("/api/order-assignment/available-zones", async (req, res, next) => {
  try {
    const result = await orderAssignmentController.getAvailableZones();
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.post("/api/order-assignment/test-address-matching", Admin as any, async (req: any, res, next) => {
  try {
    const result = await orderAssignmentController.testAddressMatching(req.body);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.put("/api/order-assignment/working-zone/:shipperId", Admin as any, async (req: any, res, next) => {
  try {
    const result = await orderAssignmentController.updateWorkingZone(req.params.shipperId, req.body);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

export default router;

