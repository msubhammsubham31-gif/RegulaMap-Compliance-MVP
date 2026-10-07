import { Router, type IRouter } from "express";
import healthRouter from "./health";
import regulamapRouter from "./regulamap";

const router: IRouter = Router();

router.use(healthRouter);
router.use(regulamapRouter);

export default router;
