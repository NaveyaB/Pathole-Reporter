import {
  getComplaintsStore,
  getUsersStore,
  districtNames,
} from "../data/store.js";
import { daysBetween } from "../utils/datetime.js";
import type {
  DashboardStats,
  TrendPoint,
} from "../types/index.js";

export const getOverviewStats = async (): Promise<DashboardStats> => {
  const complaints = await getComplaintsStore().find({});
  const [citizens, contractors] = await Promise.all([
    getUsersStore().count({ role: "citizen" }),
    getUsersStore().count({ role: "contractor" }),
  ]);

  const byStatus = (status: string) => complaints.filter((c) => c.status === status).length;
  const byPriority = (priority: string) => complaints.filter((c) => c.priority === priority).length;

  const completed = complaints.filter((c) => c.status === "completed");
  const durations = completed
    .map((c) => daysBetween(c.timestamps.created, c.completedAt ?? c.timestamps.updated))
    .filter((d) => d >= 0);

  const withAi = complaints.filter((c) => c.aiAnalysis?.confidence != null);
  const avgAiConf =
    withAi.length > 0
      ? withAi.reduce((sum, c) => sum + (c.aiAnalysis?.confidence ?? 0), 0) / withAi.length
      : 0;

  const resolutionRate = complaints.length > 0 ? (completed.length / complaints.length) * 100 : 0;

  return {
    totalComplaints: complaints.length,
    pendingReview: byStatus("submitted") + byStatus("under_review"),
    verified: byStatus("verified"),
    inProgress: byStatus("assigned") + byStatus("in_progress"),
    completed: completed.length,
    highPriority: byPriority("high") + byPriority("critical"),
    rejected: byStatus("rejected"),
    avgCompletionDays: durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : 0,
    resolutionRate: Math.round(resolutionRate * 10) / 10,
    activeContractors: contractors,
    registeredCitizens: citizens,
    aiDetectionRate: Math.round(avgAiConf * 10) / 10,
  };
};

export const getTrends = async (months = 12): Promise<TrendPoint[]> => {
  const complaints = await getComplaintsStore().find({});
  const now = new Date();

  const points: TrendPoint[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleString("en-US", { month: "short" });
    const inMonth = complaints.filter(
      (c) =>
        c.timestamps.created.slice(0, 7) === key ||
        (c.status === "completed" && (c.completedAt ?? c.timestamps.updated).slice(0, 7) === key)
    );
    points.push({
      month: key,
      year: d.getFullYear(),
      label,
      submitted: complaints.filter((c) => c.timestamps.created.slice(0, 7) === key).length,
      verified: inMonth.filter((c) => c.verifiedAt?.slice(0, 7) === key).length,
      completed: inMonth.filter((c) => (c.completedAt ?? c.timestamps.updated).slice(0, 7) === key).length,
    });
  }
  return points;
};

export const getDistrictBreakdown = async () => {
  const complaints = await getComplaintsStore().find({});
  return districtNames.map((district) => {
    const list = complaints.filter((c) => c.district === district);
    return {
      district,
      total: list.length,
      pending: list.filter((c) => ["submitted", "under_review", "verified"].includes(c.status)).length,
      inProgress: list.filter((c) => ["assigned", "in_progress"].includes(c.status)).length,
      completed: list.filter((c) => c.status === "completed").length,
      highPriority: list.filter((c) => c.priority === "high" || c.priority === "critical").length,
      completionRate: list.length ? Math.round((list.filter((c) => c.status === "completed").length / list.length) * 100) : 0,
    };
  });
};

export const getStatusDistribution = async () => {
  const complaints = await getComplaintsStore().find({});
  const labels = ["submitted", "under_review", "verified", "assigned", "in_progress", "completed", "rejected"];
  return labels.map((status) => ({
    status,
    count: complaints.filter((c) => c.status === status).length,
  }));
};

export const getSeverityDistribution = async () => {
  const complaints = await getComplaintsStore().find({});
  const labels = ["low", "medium", "high", "critical"];
  return labels.map((severity) => ({
    severity,
    count: complaints.filter((c) => c.aiAnalysis?.severity === severity).length,
  }));
};

export const getTypeDistribution = async () => {
  const complaints = await getComplaintsStore().find({});
  const map = new Map<string, number>();
  complaints.forEach((c) => map.set(c.type, (map.get(c.type) ?? 0) + 1));
  return Array.from(map.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);
};

export const getRepairPerformance = async () => {
  const complaints = await getComplaintsStore().find({});
  const completed = complaints.filter((c) => c.status === "completed" && c.completedAt);
  const contractorIds = new Set(completed.map((c) => c.assignedContractor).filter(Boolean));
  const users = await getUsersStore().find({ id: { $in: Array.from(contractorIds) } });

  return users.map((user) => {
    const jobs = completed.filter((c) => c.assignedContractor === user.id);
    const avgDays =
      jobs.length > 0
        ? jobs.reduce((sum, c) => sum + daysBetween(c.timestamps.created, c.completedAt as string), 0) / jobs.length
        : 0;
    const avgRating =
      jobs.length > 0
        ? jobs.reduce((sum, c) => sum + (c.feedback?.rating ?? 0), 0) / jobs.length
        : 0;
    return {
      contractorId: user.id,
      name: user.name,
      completed: jobs.length,
      avgRepairDays: Math.round(avgDays * 10) / 10,
      avgRating: Math.round(avgRating * 10) / 10,
      onTime: Math.round((jobs.filter((c) => daysBetween(c.timestamps.created, c.completedAt as string) <= 4).length / Math.max(1, jobs.length)) * 100),
    };
  });
};

export const getAiAccuracy = async () => {
  const complaints = await getComplaintsStore().find({});
  const rated = complaints.filter((c) => c.feedback && c.aiAnalysis);
  return {
    avgConfidence: complaints.length
      ? Math.round((complaints.reduce((s, c) => s + (c.aiAnalysis?.confidence ?? 0), 0) / complaints.length) * 10) / 10
      : 0,
    samples: complaints.filter((c) => c.aiAnalysis).length,
    feedbackSatisfaction: rated.length
      ? Math.round((rated.reduce((s, c) => s + (c.feedback?.rating ?? 0), 0) / rated.length) * 10) / 10
      : 0,
    highSeverityDetected: complaints.filter((c) => c.aiAnalysis?.severity === "high" || c.aiAnalysis?.severity === "critical").length,
  };
};
