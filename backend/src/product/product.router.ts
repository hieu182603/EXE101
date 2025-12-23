import { Router } from "express";
import { Container } from "typedi";
import { ProductController } from "./product.controller";
import { Auth } from "@/middlewares/auth.middleware";
import { checkAbility } from "@/middlewares/rbac/permission.middleware";
import { Product } from "./product.entity";

const router = Router();
const productController = Container.get(ProductController);

router.get("/products", async (req, res, next) => {
  try {
    const result = await productController.getAllProducts();
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.get("/products/all-including-out-of-stock", Auth as any, checkAbility("read", Product), async (req: any, res, next) => {
  try {
    const result = await productController.getAllProductsIncludingOutOfStock(req);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.get("/products/admin/all", async (req, res, next) => {
  try {
    const result = await productController.getAllProductsForAdmin();
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.get("/products/out-of-stock", Auth as any, checkAbility("read", Product), async (req: any, res, next) => {
  try {
    const result = await productController.getOutOfStockProducts(req);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.get("/products/new", async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 8;
    const result = await productController.getNewProducts(limit);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.get("/products/top-selling", async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 6;
    const result = await productController.getTopSellingProducts(limit);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.get("/products/category/:categoryId", async (req, res, next) => {
  try {
    const result = await productController.getProductsByCategory(req.params.categoryId);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.get("/products/category-name/:categoryName", async (req, res, next) => {
  try {
    const result = await productController.getProductsByCategoryName(req.params.categoryName);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.get("/products/search", async (req, res, next) => {
  try {
    const result = await productController.searchProducts(req.query.q as string);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.get("/products/:id", async (req, res, next) => {
  try {
    const result = await productController.getProductById(req.params.id);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.get("/products/name/:name", async (req, res, next) => {
  try {
    const result = await productController.getProductByName(req.params.name);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.post("/products", Auth as any, checkAbility("create", Product), async (req: any, res, next) => {
  try {
    const result = await productController.createProduct(req.body, req);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.put("/products/:id", async (req, res, next) => {
  try {
    const result = await productController.updateProduct(req.params.id, req.body);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.delete("/products/:id", async (req, res, next) => {
  try {
    const result = await productController.deleteProduct(req.params.id);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.get("/products/main-category/:categoryId", async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 8;
    const result = await productController.getProductsByMainCategory(req.params.categoryId, limit);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.get("/products/categories/all", async (req, res, next) => {
  try {
    const result = await productController.getAllCategories();
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.get("/products/categories/multiple", async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 8;
    const result = await productController.getProductsByMultipleCategories(
      req.query.categoryIds as string,
      limit
    );
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.get("/products/type/:type", async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 8;
    const result = await productController.getProductsByType(req.params.type as 'laptop' | 'pc' | 'accessories', limit);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

export default router;

