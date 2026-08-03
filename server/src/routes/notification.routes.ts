import { Router } from "express";
import * as notifications from "../controllers/notificationController.js";
import { authenticate } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(authenticate);

router.get("/", asyncHandler(notifications.listNotifications));
router.patch("/:id/read", asyncHandler(notifications.markRead));
router.post("/read-all", asyncHandler(notifications.markAllRead));
router.delete("/", asyncHandler(notifications.clearAll));

export default router;
