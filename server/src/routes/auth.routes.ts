import { Router } from "express";
import * as auth from "../controllers/authController.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.post("/register", asyncHandler(auth.register));
router.post("/login", asyncHandler(auth.login));
router.get("/demo-accounts", asyncHandler(auth.getDemoAccounts));
router.get("/me", authenticate, asyncHandler(auth.me));
router.put("/profile", authenticate, asyncHandler(auth.updateProfile));
router.put("/password", authenticate, asyncHandler(auth.changePassword));

export default router;
