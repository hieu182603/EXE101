import { Router } from "express";
import { Container } from "typedi";
import { FeedbackController } from "./feedback.controller";

const router = Router();
const feedbackController = Container.get(FeedbackController);

router.get("/feedbacks", async (req, res, next) => {
  try {
    const result = await feedbackController.getAll();
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.get("/feedbacks/paginated", async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const result = await feedbackController.getPaginated(page, pageSize);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.get("/feedbacks/product/:productId", async (req, res, next) => {
  try {
    const result = await feedbackController.getFeedbacksByProduct(req.params.productId);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.get("/feedbacks/export", async (req, res, next) => {
  try {
    await feedbackController.exportFeedbacks(res);
  } catch (error: any) {
    next(error);
  }
});

router.get("/feedbacks/:id", async (req, res, next) => {
  try {
    const result = await feedbackController.getOne(req.params.id);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.delete("/feedbacks/:id", async (req, res, next) => {
  try {
    await feedbackController.delete(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    next(error);
  }
});

export default router;













