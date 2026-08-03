import { Router } from "express";
import * as complaint from "../controllers/complaintController.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { upload } from "../middleware/upload.js";

const router = Router();

router.use(authenticate);

router.get("/stats", asyncHandler(complaint.getStats));
router.get("/map", asyncHandler(complaint.getMapComplaints));
router.get("/me", asyncHandler(complaint.myComplaints));
router.get("/", asyncHandler(complaint.listComplaints));

router.post(
  "/",
  upload.array("images", 6),
  asyncHandler(complaint.createComplaint)
);

router.get("/:reportNumber", asyncHandler(complaint.getComplaintById));

router.patch(
  "/:reportNumber/verify",
  authorize("admin", "super_admin"),
  asyncHandler(complaint.verifyComplaint)
);
router.patch(
  "/:reportNumber/assign",
  authorize("admin", "super_admin"),
  asyncHandler(complaint.assignContractor)
);
router.patch(
  "/:reportNumber/status",
  authorize("contractor", "admin", "super_admin"),
  asyncHandler(complaint.updateStatus)
);
router.patch(
  "/:reportNumber/complete",
  authorize("contractor", "admin", "super_admin"),
  upload.array("images", 6),
  asyncHandler(complaint.completeComplaint)
);
router.patch(
  "/:reportNumber/reject",
  authorize("admin", "super_admin"),
  asyncHandler(complaint.rejectComplaint)
);
router.post("/:reportNumber/feedback", asyncHandler(complaint.submitFeedback));

export default router;
