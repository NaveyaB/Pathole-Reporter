import { Router } from "express";
import * as analytics from "../controllers/analyticsController.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(authenticate, authorize("admin", "super_admin"));

router.get("/overview", asyncHandler(analytics.overview));
router.get("/trends", asyncHandler(analytics.trends));
router.get("/districts", asyncHandler(analytics.districts));
router.get("/status", asyncHandler(analytics.statusDistribution));
router.get("/severity", asyncHandler(analytics.severityDistribution));
router.get("/types", asyncHandler(analytics.typeDistribution));
router.get("/contractors", asyncHandler(analytics.repairPerformance));
router.get("/ai-accuracy", asyncHandler(analytics.aiAccuracy));
router.get("/activity", asyncHandler(analytics.activityLogs));

export default router;
