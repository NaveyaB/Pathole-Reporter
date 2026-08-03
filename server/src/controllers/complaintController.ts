import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { sendSuccess } from "../utils/response.js";
import { generateId, nowIso, daysBetween } from "../utils/datetime.js";
import { getComplaintsStore, getUsersStore, nextReportNumber } from "../data/store.js";
import { analyzeImage, findDuplicates } from "../services/aiService.js";
import { notify } from "../services/notificationService.js";
import { toPublicUrl } from "../middleware/upload.js";
import type { Complaint, ComplaintStatus } from "../types/index.js";
import { getOverviewStats } from "../services/analyticsService.js";

const VALID_STATUS: ComplaintStatus[] = ["submitted", "under_review", "verified", "assigned", "in_progress", "completed", "rejected"];
const VALID_PRIORITIES = ["low", "medium", "high", "critical"];

const toDto = (c: Complaint) => c;

const attachReporter = async (complaints: Complaint[]) => {
  const userIds = Array.from(new Set(complaints.map((c) => c.reporter).filter(Boolean)));
  const reporters = await getUsersStore().find({ id: { $in: userIds } });
  const map = new Map(reporters.map((u) => [u.id, u]));
  return complaints.map((c) => ({
    ...c,
    reporterUser: map.get(c.reporter) ? { id: c.reporter, name: map.get(c.reporter)?.name } : undefined,
  }));
};

/* ---------------- Citizen: create complaint ---------------- */

export const createComplaint = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw ApiError.unauthorized();

  const { title, description, location, district, address, type } = req.body as Record<string, unknown>;

  if (!title || !location) throw ApiError.badRequest("Title and location are required");

  const parsedLocation =
    typeof location === "string"
      ? JSON.parse(location)
      : (location as { lat: number; lng: number });
  if (!parsedLocation?.lat || !parsedLocation?.lng) {
    throw ApiError.badRequest("Valid GPS location is required");
  }

  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  const images = files.map((f) => ({ url: toPublicUrl(f.filename) }));

  if (files.length === 0) throw ApiError.badRequest("At least one photo is required for AI analysis");
  const ai = await analyzeImage(files[0]);

  const nearby = await getComplaintsStore().find({ district: district ? String(district) : undefined });
  const dup = findDuplicates(parsedLocation, nearby.map((c) => ({ location: c.location, id: c.id })));

  const now = nowIso();
  const reportNumber = await nextReportNumber();
  const complaint: Complaint = {
    id: generateId("cmp"),
    reportNumber,
    title: String(title),
    description: description ? String(description) : undefined,
    images,
    location: { lat: parsedLocation.lat, lng: parsedLocation.lng },
    address: address ? String(address) : undefined,
    district: district ? String(district) : undefined,
    type: ai.analysis.detected,
    status: "submitted",
    priority:
      ai.analysis.severity === "critical"
        ? "critical"
        : ai.analysis.severity === "high"
        ? "high"
        : ai.analysis.severity === "medium"
        ? "medium"
        : "low",
    reporter: userId,
    aiAnalysis: ai.analysis,
    duplicateOf: dup.score > 82 ? dup.matchId : undefined,
    timestamps: { created: now, updated: now },
  };

  await getComplaintsStore().create(complaint);

  await notify({
    userId,
    type: "complaint",
    title: "Complaint registered",
    message: `${complaint.reportNumber} has been registered and sent for AI analysis.`,
    link: `/complaints/${complaint.reportNumber}`,
  });
  await notify({
    userId,
    type: "ai",
    title: "AI analysis complete",
    message: `AI detected a ${ai.analysis.severity} severity ${ai.analysis.detected.replace("_", " ")} with ${ai.analysis.confidence}% confidence.`,
    link: `/complaints/${complaint.reportNumber}`,
  });

  const admins = await getUsersStore().find({ role: "admin" });
  for (const admin of admins) {
    await notify({
      userId: admin.id,
      type: "complaint",
      title: "New complaint submitted",
      message: `${complaint.reportNumber} — ${complaint.title}`,
      link: `/admin/complaints/${complaint.reportNumber}`,
    });
  }

  sendSuccess(res, toDto(complaint), "Complaint submitted successfully", 201);
});

/* ---------------- List complaints ---------------- */

export const listComplaints = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize as string) || 12));
  const filter: Record<string, unknown> = {};

  const { status, district, priority, severity, type, search, contractor } = req.query as Record<string, string>;

  if (status) filter.status = status;
  if (district) filter.district = district;
  if (priority) filter.priority = priority;
  if (severity) filter["aiAnalysis.severity"] = severity;
  if (type) filter.type = type;
  if (contractor) filter.assignedContractor = contractor;

  const all = await getComplaintsStore().all();
  let result = all;

  if (search) {
    const regex = new RegExp(String(search), "i");
    result = result.filter(
      (c) => regex.test(c.title) || regex.test(c.reportNumber) || regex.test(c.address ?? "")
    );
  }

  result = result.filter((c) =>
    Object.entries(filter).every(([key, value]) => {
      const path = key.split(".");
      let v: unknown = c;
      for (const p of path) v = (v as Record<string, unknown>)?.[p];
      return v === value;
    })
  );

  result = result.sort(
    (a, b) => new Date(b.timestamps.created).getTime() - new Date(a.timestamps.created).getTime()
  );

  const total = result.length;
  const pageData = result.slice((page - 1) * pageSize, page * pageSize);
  const withReporter = await attachReporter(pageData);

  sendSuccess(res, withReporter, "Complaints fetched", 200, {
    page, pageSize, total, totalPages: Math.ceil(total / pageSize),
  });
});

export const myComplaints = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw ApiError.unauthorized();
  const data = await getComplaintsStore().find({ reporter: userId }, { sort: { "timestamps.created": -1 } });
  sendSuccess(res, data, "Your complaints fetched");
});

export const getComplaintById = asyncHandler(async (req: Request, res: Response) => {
  const { reportNumber } = req.params;
  const complaint = await getComplaintsStore().findOne({ reportNumber });
  if (!complaint) throw ApiError.notFound("Complaint not found");

  const role = req.user?.role;
  const userId = req.user?.id;
  const isAdmin = role === "admin" || role === "super_admin";
  const isReporter = complaint.reporter === userId;
  const isContractor = complaint.assignedContractor === userId;

  if (!isAdmin && !isReporter && !isContractor) {
    throw ApiError.forbidden("You do not have access to this complaint");
  }

  const [reporter, contractor] = await Promise.all([
    getUsersStore().findById(complaint.reporter),
    complaint.assignedContractor ? getUsersStore().findById(complaint.assignedContractor) : Promise.resolve(null),
  ]);

  let duplicate: Complaint | null = null;
  if (complaint.duplicateOf) {
    duplicate = await getComplaintsStore().findById(complaint.duplicateOf);
  }

  sendSuccess(res, {
    ...complaint,
    reporterUser: reporter ? { id: reporter.id, name: reporter.name, phone: reporter.phone, email: reporter.email } : undefined,
    contractorUser: contractor ? { id: contractor.id, name: contractor.name, phone: contractor.phone, contractor: contractor.contractor } : undefined,
    duplicate,
  });
});

/* ---------------- Admin workflow ---------------- */

export const verifyComplaint = asyncHandler(async (req: Request, res: Response) => {
  const { reportNumber } = req.params;
  const complaint = await getComplaintsStore().findOne({ reportNumber });
  if (!complaint) throw ApiError.notFound("Complaint not found");
  if (!["submitted", "under_review"].includes(complaint.status)) {
    throw ApiError.badRequest("Only submitted or under-review complaints can be verified");
  }

  const updated = await getComplaintsStore().updateById(complaint.id, {
    $set: { status: "verified", verifiedBy: req.user?.id, verifiedAt: nowIso(), "timestamps.updated": nowIso() },
  });

  await notify({
    userId: complaint.reporter,
    type: "complaint",
    title: "Complaint verified",
    message: `${complaint.reportNumber} has been verified by the municipality and queued for repair.`,
    link: `/complaints/${complaint.reportNumber}`,
  });

  sendSuccess(res, updated, "Complaint verified");
});

export const assignContractor = asyncHandler(async (req: Request, res: Response) => {
  const { reportNumber } = req.params;
  const { contractorId } = req.body as { contractorId?: string };
  if (!contractorId) throw ApiError.badRequest("Contractor is required");

  const complaint = await getComplaintsStore().findOne({ reportNumber });
  if (!complaint) throw ApiError.notFound("Complaint not found");

  const contractor = await getUsersStore().findById(contractorId);
  if (!contractor || contractor.role !== "contractor") throw ApiError.badRequest("Invalid contractor");

  const updated = await getComplaintsStore().updateById(complaint.id, {
    $set: {
      status: "assigned",
      assignedContractor: contractorId,
      assignedAt: nowIso(),
      "timestamps.updated": nowIso(),
    },
  });

  await notify({
    userId: contractorId,
    type: "assignment",
    title: "New work assignment",
    message: `${complaint.reportNumber} — ${complaint.title} assigned to your team.`,
    link: `/contractor/jobs/${complaint.reportNumber}`,
  });
  await notify({
    userId: complaint.reporter,
    type: "assignment",
    title: "Contractor assigned",
    message: `${contractor.name} has been assigned to repair ${complaint.reportNumber}.`,
    link: `/complaints/${complaint.reportNumber}`,
  });

  sendSuccess(res, updated, "Contractor assigned");
});

export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const { reportNumber } = req.params;
  const { status } = req.body as { status?: ComplaintStatus };
  if (!status || !VALID_STATUS.includes(status)) throw ApiError.badRequest("Invalid status");

  const complaint = await getComplaintsStore().findOne({ reportNumber });
  if (!complaint) throw ApiError.notFound("Complaint not found");

  const updates: Record<string, unknown> = { status, "timestamps.updated": nowIso() };
  if (status === "in_progress") updates.startedAt = nowIso();
  if (status === "under_review") updates.verifiedAt = nowIso();

  const updated = await getComplaintsStore().updateById(complaint.id, { $set: updates });

  const label = status.replace("_", " ");
  await notify({
    userId: complaint.reporter,
    type: "complaint",
    title: "Status updated",
    message: `${complaint.reportNumber} status is now "${label}".`,
    link: `/complaints/${complaint.reportNumber}`,
  });

  sendSuccess(res, updated, `Status updated to ${status}`);
});

export const completeComplaint = asyncHandler(async (req: Request, res: Response) => {
  const { reportNumber } = req.params;
  const { notes, repairType } = req.body as { notes?: string; repairType?: string };
  const complaint = await getComplaintsStore().findOne({ reportNumber });
  if (!complaint) throw ApiError.notFound("Complaint not found");
  if (complaint.status !== "assigned" && complaint.status !== "in_progress") {
    throw ApiError.badRequest("Complaint must be assigned or in progress before completion");
  }

  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  const afterImages = files.map((f) => ({ url: toPublicUrl(f.filename) }));
  const completedAt = nowIso();

  const updated = await getComplaintsStore().updateById(complaint.id, {
    $set: {
      status: "completed",
      completedAt,
      "timestamps.updated": completedAt,
      completion: {
        beforeImages: complaint.completion?.beforeImages ?? [],
        afterImages,
        notes: notes ?? "Repair completed.",
        repairType: repairType ?? "asphalt-patching",
        completedBy: req.user?.id,
        completedAt,
        durationHours: complaint.startedAt ? Math.round((new Date(completedAt).getTime() - new Date(complaint.startedAt).getTime()) / 3600000) : undefined,
      },
    },
  });

  await notify({
    userId: complaint.reporter,
    type: "completion",
    title: "Repair completed",
    message: `Great news! ${complaint.reportNumber} has been repaired. Please share your feedback.`,
    link: `/complaints/${complaint.reportNumber}`,
  });

  const admins = await getUsersStore().find({ role: "admin" });
  for (const admin of admins) {
    await notify({
      userId: admin.id,
      type: "completion",
      title: "Repair completed",
      message: `${complaint.reportNumber} marked completed by contractor.`,
      link: `/admin/complaints/${complaint.reportNumber}`,
    });
  }

  sendSuccess(res, updated, "Complaint marked as completed");
});

export const rejectComplaint = asyncHandler(async (req: Request, res: Response) => {
  const { reportNumber } = req.params;
  const { reason } = req.body as { reason?: string };
  const complaint = await getComplaintsStore().findOne({ reportNumber });
  if (!complaint) throw ApiError.notFound("Complaint not found");

  const updated = await getComplaintsStore().updateById(complaint.id, {
    $set: {
      status: "rejected",
      rejectedReason: reason ?? "Rejected by municipality",
      "timestamps.updated": nowIso(),
    },
  });

  await notify({
    userId: complaint.reporter,
    type: "complaint",
    title: "Complaint rejected",
    message: `${complaint.reportNumber} was not accepted. ${reason ?? ""}`,
    link: `/complaints/${complaint.reportNumber}`,
  });

  sendSuccess(res, updated, "Complaint rejected");
});

/* ---------------- Citizen feedback ---------------- */

export const submitFeedback = asyncHandler(async (req: Request, res: Response) => {
  const { reportNumber } = req.params;
  const { rating, comment } = req.body as { rating?: number; comment?: string };
  if (!rating || rating < 1 || rating > 5) throw ApiError.badRequest("Rating must be between 1 and 5");

  const complaint = await getComplaintsStore().findOne({ reportNumber });
  if (!complaint) throw ApiError.notFound("Complaint not found");
  if (complaint.status !== "completed") throw ApiError.badRequest("Feedback is only available for completed repairs");
  if (complaint.reporter !== req.user?.id) throw ApiError.forbidden("Only the reporter can submit feedback");

  const updated = await getComplaintsStore().updateById(complaint.id, {
    $set: {
      feedback: { rating, comment: comment ?? undefined, createdAt: nowIso() },
      "timestamps.updated": nowIso(),
    },
  });

  if (complaint.assignedContractor) {
    await notify({
      userId: complaint.assignedContractor,
      type: "feedback",
      title: "New feedback received",
      message: `Citizen rated the repair of ${complaint.reportNumber} ${rating}/5.`,
      link: `/contractor/jobs/${complaint.reportNumber}`,
    });
  }

  sendSuccess(res, updated, "Feedback submitted — thank you!");
});

/* ---------------- Map + stats ---------------- */

export const getMapComplaints = asyncHandler(async (req: Request, res: Response) => {
  const { district, severity, status, limit } = req.query as Record<string, string>;
  const all = await getComplaintsStore().all();
  let list = all;

  if (district) list = list.filter((c) => c.district === district);
  if (severity) list = list.filter((c) => c.aiAnalysis?.severity === severity);
  if (status) list = list.filter((c) => c.status === status);

  const max = Math.min(500, parseInt(limit ?? "200", 10) || 200);
  list = list.slice(0, max);

  sendSuccess(
    res,
    list.map((c) => ({
      id: c.id,
      reportNumber: c.reportNumber,
      title: c.title,
      location: c.location,
      district: c.district,
      status: c.status,
      priority: c.priority,
      severity: c.aiAnalysis?.severity,
      type: c.type,
      createdAt: c.timestamps.created,
    })),
    "Map complaints fetched"
  );
});

export const getStats = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await getOverviewStats();
  sendSuccess(res, stats, "Dashboard stats fetched");
});
