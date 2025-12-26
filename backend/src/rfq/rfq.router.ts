import { Router } from "express";
import { Container } from "typedi";
import { RFQController } from "./rfq.controller";

const router = Router();
const rfqController = Container.get(RFQController);

router.post("/request-for-quota/builds", async (req, res, next) => {
  try {
    const result = await rfqController.getBuilds(req.body);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

export default router;














