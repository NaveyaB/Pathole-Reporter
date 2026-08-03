import { api, extractData, type ApiResponse } from "@/lib/api";
import type {
  Complaint,
  ComplaintStatus,
  ContractorStats,
  DashboardStats,
  MapComplaint,
  NotificationItem,
  User,
} from "@/types";

export interface AuthResponse {
  user: User;
  token: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { page: number; pageSize: number; total: number; totalPages: number };
}

const unwrapPaginated = async <T>(promise: Promise<{ data: ApiResponse<T[]> }>): Promise<PaginatedResponse<T>> => {
  const { data } = await promise;
  return {
    data: data.data,
    meta: {
      page: data.meta?.page ?? 1,
      pageSize: data.meta?.pageSize ?? 20,
      total: data.meta?.total ?? data.data.length,
      totalPages: data.meta?.totalPages ?? 1,
    },
  };
};

export const authApi = {
  login: (email: string, password: string) =>
    extractData<AuthResponse>(api.post("/auth/login", { email, password })),
  register: (payload: Record<string, unknown>) =>
    extractData<AuthResponse>(api.post("/auth/register", payload)),
  me: () => extractData<{ user: User }>(api.get("/auth/me")).then((d) => d.user),
  updateProfile: (payload: Record<string, unknown>) =>
    extractData<{ user: User }>(api.put("/auth/profile", payload)).then((d) => d.user),
  changePassword: (currentPassword: string, newPassword: string) =>
    extractData<null>(api.put("/auth/password", { currentPassword, newPassword })),
  demoAccounts: () =>
    extractData<{ accounts: Array<{ role: string; email: string; password: string; hint: string }> }>(
      api.get("/auth/demo-accounts")
    ),
};

export const complaintApi = {
  create: (formData: FormData) => extractData<Complaint>(api.post("/complaints", formData)),
  list: (params?: Record<string, string | number | undefined>) =>
    unwrapPaginated<Complaint>(api.get("/complaints", { params })),
  mine: () => extractData<Complaint[]>(api.get("/complaints/me")),
  byNumber: (reportNumber: string) => extractData<Complaint>(api.get(`/complaints/${reportNumber}`)),
  stats: () => extractData<DashboardStats>(api.get("/complaints/stats")),
  map: (params?: Record<string, string | undefined>) =>
    extractData<MapComplaint[]>(api.get("/complaints/map", { params })),
  verify: (reportNumber: string) => extractData<Complaint>(api.patch(`/complaints/${reportNumber}/verify`)),
  assign: (reportNumber: string, contractorId: string) =>
    extractData<Complaint>(api.patch(`/complaints/${reportNumber}/assign`, { contractorId })),
  updateStatus: (reportNumber: string, status: ComplaintStatus) =>
    extractData<Complaint>(api.patch(`/complaints/${reportNumber}/status`, { status })),
  complete: (reportNumber: string, formData: FormData) =>
    extractData<Complaint>(api.patch(`/complaints/${reportNumber}/complete`, formData)),
  reject: (reportNumber: string, reason: string) =>
    extractData<Complaint>(api.patch(`/complaints/${reportNumber}/reject`, { reason })),
  feedback: (reportNumber: string, rating: number, comment?: string) =>
    extractData<Complaint>(api.post(`/complaints/${reportNumber}/feedback`, { rating, comment })),
};

export const userApi = {
  list: (params?: Record<string, string | number | undefined>) =>
    unwrapPaginated<User>(api.get("/users", { params })),
  contractorStats: () =>
    extractData<ContractorStats[]>(api.get("/users/contractors/stats")),
  create: (payload: Record<string, unknown>) => extractData<{ user: User }>(api.post("/users", payload)),
  update: (id: string, payload: Record<string, unknown>) =>
    extractData<{ user: User }>(api.patch(`/users/${id}`, payload)),
  remove: (id: string) => extractData<null>(api.delete(`/users/${id}`)),
};

export const notificationApi = {
  list: (limit = 30) => extractData<NotificationItem[]>(api.get("/notifications", { params: { limit } })),
  markRead: (id: string) => extractData<NotificationItem | null>(api.patch(`/notifications/${id}/read`)),
  markAllRead: () => extractData<null>(api.post("/notifications/read-all")),
  clearAll: () => extractData<null>(api.delete("/notifications")),
};

export const analyticsApi = {
  overview: () => extractData<DashboardStats>(api.get("/analytics/overview")),
  trends: (months = 12) => extractData<Array<{ month: string; year: number; label: string; submitted: number; verified: number; completed: number }>>(
    api.get("/analytics/trends", { params: { months } })
  ),
  districts: () =>
    extractData<Array<{ district: string; total: number; pending: number; inProgress: number; completed: number; highPriority: number; completionRate: number }>>(
      api.get("/analytics/districts")
    ),
  status: () => extractData<Array<{ status: ComplaintStatus; count: number }>>(api.get("/analytics/status")),
  severity: () => extractData<Array<{ severity: string; count: number }>>(api.get("/analytics/severity")),
  types: () => extractData<Array<{ type: string; count: number }>>(api.get("/analytics/types")),
  contractors: () =>
    extractData<Array<{ contractorId: string; name: string; completed: number; avgRepairDays: number; avgRating: number; onTime: number }>>(
      api.get("/analytics/contractors")
    ),
  aiAccuracy: () =>
    extractData<{ avgConfidence: number; samples: number; feedbackSatisfaction: number; highSeverityDetected: number }>(
      api.get("/analytics/ai-accuracy")
    ),
  activity: (limit = 40) =>
    extractData<Array<{ id: string; action: string; description: string; createdAt: string }>>(
      api.get("/analytics/activity", { params: { limit } })
    ),
};

export const aiApi = {
  analyze: (formData: FormData) =>
    extractData<{ detected: string; severity: string; confidence: number; recommendation: string; isRoadImage: boolean; tags: string[]; model: string; imageUrl?: string }>(
      api.post("/ai/analyze", formData)
    ),
  health: () => extractData<{ status: string; model: string }>(api.get("/ai/health")),
};

export const uploadApi = {
  image: (formData: FormData) =>
    extractData<{ url: string; name: string; size: number; mimetype: string }>(api.post("/ai/upload", formData)),
};
