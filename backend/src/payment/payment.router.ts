import { Router } from "express";
import { Container } from "typedi";
import { InvoiceController } from "./invoice.controller";
import { PaymentController } from "./payment.controller";
import { Auth, Admin } from "@/middlewares/auth.middleware";
import { checkAbility } from "@/middlewares/rbac/permission.middleware";
import { Invoice } from "./invoice.entity";
import { validate } from "@/middlewares/validation.middleware";
import { CreateInvoiceSchema } from "./dtos/invoice.schema";
import { UpdatePaymentStatusSchema } from "./dtos/payment.schema";

const router = Router();
const invoiceController = Container.get(InvoiceController);
const paymentController = Container.get(PaymentController);

// Invoice routes
router.post("/invoices/create", validate(CreateInvoiceSchema), async (req, res, next) => {
  try {
    const result = await invoiceController.createInvoice(req.body, req);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.get("/invoices/order/:orderId", async (req, res, next) => {
  try {
    const result = await invoiceController.getInvoiceByOrderId(req.params.orderId, req);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.get("/invoices/number/:invoiceNumber", async (req, res, next) => {
  try {
    const result = await invoiceController.getInvoiceByNumber(req.params.invoiceNumber, req);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.get("/invoices/my", Auth as any, async (req: any, res, next) => {
  try {
    const result = await invoiceController.getMyInvoices(
      req,
      parseInt(req.query.page as string) || 1,
      parseInt(req.query.limit as string) || 10
    );
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.put("/invoices/:id/paid", Auth as any, checkAbility("update", Invoice), async (req: any, res, next) => {
  try {
    const result = await invoiceController.markAsPaid(req.params.id, req);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.put("/invoices/:id/cancel", Admin as any, async (req: any, res, next) => {
  try {
    const result = await invoiceController.cancelInvoice(req.params.id, req.body);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

// Payment routes
router.post("/payment/update-payment-status", validate(UpdatePaymentStatusSchema), async (req, res, next) => {
  try {
    await paymentController.updatePaymentStatus(req.body);
    res.json({ success: true, message: "Payment status updated" });
  } catch (error: any) {
    next(error);
  }
});

router.get("/payment/status/:orderId", async (req, res, next) => {
  try {
    const result = await paymentController.getPaymentStatus(req.params.orderId, req);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.get("/payment/history", Auth as any, async (req: any, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await paymentController.getPaymentHistory(
      req,
      page,
      limit
    );
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

export default router;

