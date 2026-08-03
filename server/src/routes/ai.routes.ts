import { Router } from "express";
import * as ai from "../controllers/aiController.js";
import * as upload from "../controllers/uploadController.js";
import { authenticate } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { upload as uploadMiddleware } from "../middleware/upload.js";

const router = Router();

router.get("/health", asyncHandler(ai.health));
router.post(
  "/analyze",
  authenticate,
  uploadMiddleware.single("image"),
  asyncHandler(ai.analyze)
);
router.post(
  "/upload",
  authenticate,
  uploadMiddleware.single("image"),
  asyncHandler(upload.uploadImage)
);

export default router;
