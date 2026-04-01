import { Router, type IRouter } from "express";
import healthRouter from "./health";
import intakeRouter from "./intake";
import insightsRouter from "./insights";
import referralsRouter from "./referrals";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/intake", intakeRouter);
router.use("/insights", insightsRouter);
router.use("/referrals", referralsRouter);

export default router;
