import { Router } from "express";
import * as location from "../controllers/locationController.js";
import { authenticate } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(authenticate);

router.post("/validate", asyncHandler(location.validate));
router.post("/duplicate-check", asyncHandler(location.duplicateCheck));

export default router;