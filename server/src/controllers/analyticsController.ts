import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import {
  getOverviewStats,
  getTrends,
  getDistrictBreakdown,
  getStatusDistribution,
  getSeverityDistribution,
  getTypeDistribution,
  getRepairPerformance,
  getAiAccuracy,
} from "../services/analyticsService.js";
import { getActivityLogsStore } from "../data/store.js";

export const overview = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await getOverviewStats();
  sendSuccess(res, stats, "Overview stats");
});

export const trends = asyncHandler(async (req: Request, res: Response) => {
  const months = Math.min(24, Math.max(3, parseInt(req.query.months as string) || 12));
  const data = await getTrends(months);
  sendSuccess(res, data, "Complaint trends");
});

export const districts = asyncHandler(async (_req: Request, res: Response) => {
  const data = await getDistrictBreakdown();
  sendSuccess(res, data, "District breakdown");
});

export const statusDistribution = asyncHandler(async (_req: Request, res: Response) => {
  const data = await getStatusDistribution();
  sendSuccess(res, data, "Status distribution");
});

export const severityDistribution = asyncHandler(async (_req: Request, res: Response) => {
  const data = await getSeverityDistribution();
  sendSuccess(res, data, "Severity distribution");
});

export const typeDistribution = asyncHandler(async (_req: Request, res: Response) => {
  const data = await getTypeDistribution();
  sendSuccess(res, data, "Damage type distribution");
});

export const repairPerformance = asyncHandler(async (_req: Request, res: Response) => {
  const data = await getRepairPerformance();
  sendSuccess(res, data, "Contractor repair performance");
});

export const aiAccuracy = asyncHandler(async (_req: Request, res: Response) => {
  const data = await getAiAccuracy();
  sendSuccess(res, data, "AI accuracy");
});

export const activityLogs = asyncHandler(async (req: Request, res: Response) => {
  const limit = Math.min(100, parseInt(req.query.limit as string) || 30);
  const data = await getActivityLogsStore().find({}, { sort: { createdAt: -1 as const }, limit });
  sendSuccess(res, data, "Activity logs");
});
