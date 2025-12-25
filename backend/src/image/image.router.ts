import { Router } from "express";
import { Container } from "typedi";
import multer from "multer";
import { ImageController } from "./image.controller";

const router = Router();
const imageController = Container.get(ImageController);

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

router.post("/image/upload", upload.single("file"), async (req, res, next) => {
  try {
    const result = await imageController.upload(req.file as Express.Multer.File);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.post("/image/attach-to-product", async (req, res, next) => {
  try {
    const result = await imageController.attachToProduct(req.body);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.post("/image/attach-to-feedback", async (req, res, next) => {
  try {
    const result = await imageController.attachToFeedback(req.body);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

export default router;






