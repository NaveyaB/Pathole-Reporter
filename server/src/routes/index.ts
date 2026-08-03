import { Router } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import complaintRoutes from "./complaint.routes.js";
import notificationRoutes from "./notification.routes.js";
import analyticsRoutes from "./analytics.routes.js";
import aiRoutes from "./ai.routes.js";
import { notFoundHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ success: true, message: "Smart Pothole Reporter API is healthy", data: { timestamp: new Date().toISOString() } });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/complaints", complaintRoutes);
router.use("/notifications", notificationRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/ai", aiRoutes);

router.use(notFoundHandler);

export default router;
