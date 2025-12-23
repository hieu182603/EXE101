import { Router } from "express";
import { Container } from "typedi";
import { CartController } from "./cart.controller";
import { Auth } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validation.middleware";
import { AddToCartSchema, IncreaseQuantitySchema, DecreaseQuantitySchema, RemoveItemSchema } from "./dtos/cart.schema";

const router = Router();
const cartController = Container.get(CartController);

router.post("/cart/add", Auth as any, validate(AddToCartSchema), async (req: any, res, next) => {
  try {
    const result = await cartController.addToCart(req, req.body);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.get("/cart/view", Auth as any, async (req: any, res, next) => {
  try {
    const result = await cartController.viewCart(req);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.post("/cart/increase", Auth as any, validate(IncreaseQuantitySchema), async (req: any, res, next) => {
  try {
    const result = await cartController.increaseQuantity(
      req,
      req.body.productId,
      req.body.amount || 1
    );
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.post("/cart/decrease", Auth as any, validate(DecreaseQuantitySchema), async (req: any, res, next) => {
  try {
    const result = await cartController.decreaseQuantity(
      req,
      req.body.productId,
      req.body.amount || 1
    );
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.patch("/cart/remove", Auth as any, validate(RemoveItemSchema), async (req: any, res, next) => {
  try {
    const result = await cartController.removeItem(req, req.body.productId);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.post("/cart/clear", Auth as any, async (req: any, res, next) => {
  try {
    const result = await cartController.clearCart(req);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

export default router;

