import { Router } from "express";
import { Container } from "typedi";
import { CustomerController } from "./customer.controller";
import { validate } from "@/middlewares/validation.middleware";
import { CreateCustomerSchema, UpdateCustomerSchema } from "./dtos/customer.schema";

const router = Router();
const customerController = Container.get(CustomerController);

router.post("/customers", validate(CreateCustomerSchema), async (req, res, next) => {
  try {
    const result = await customerController.createCustomer(req.body);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.get("/customers", async (req, res, next) => {
  try {
    const result = await customerController.getAllCustomers();
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.get("/customers/search", async (req, res, next) => {
  try {
    const result = await customerController.searchCustomers(req.query.q as string);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.get("/customers/:id", async (req, res, next) => {
  try {
    const result = await customerController.getCustomerById(req.params.id);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.put("/customers/:id", validate(UpdateCustomerSchema), async (req, res, next) => {
  try {
    const result = await customerController.updateCustomer(req.params.id, req.body);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.delete("/customers/:id", async (req, res, next) => {
  try {
    const result = await customerController.deleteCustomer(req.params.id);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.get("/customers/export", async (req, res, next) => {
  try {
    const result = await customerController.exportCustomers();
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

export default router;

