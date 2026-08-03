import { Router } from "express";
import * as user from "../controllers/userController.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(authenticate);

router.get("/", authorize("admin", "super_admin"), asyncHandler(user.listUsers));
router.post("/", authorize("admin", "super_admin"), asyncHandler(user.createUser));
router.get("/contractors/stats", authorize("admin", "super_admin"), asyncHandler(user.getContractorStats));
router.patch("/:id", authorize("admin", "super_admin"), asyncHandler(user.updateUser));
router.delete("/:id", authorize("admin", "super_admin"), asyncHandler(user.deleteUser));

export default router;
