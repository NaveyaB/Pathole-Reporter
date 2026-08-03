export type Role = "citizen" | "contractor" | "admin" | "super_admin";

export type UserStatus = "active" | "suspended";

export type ComplaintStatus =
  | "submitted"
  | "under_review"
  | "verified"
  | "assigned"
  | "in_progress"
  | "completed"
  | "rejected";

export type Priority = "low" | "medium" | "high" | "critical";

export type Severity = "low" | "medium" | "high" | "critical";

export type RoadDamageType =
  | "pothole"
  | "crack"
  | "rutting"
  | "depression"
  | "surface_damage"
  | "edge_damage"
  | "sinkhole"
  | "other";

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface ImageAsset {
  url: string;
  publicId?: string;
  width?: number;
  height?: number;
}

export interface AIAnalysis {
  detected: RoadDamageType;
  severity: Severity;
  confidence: number;
  recommendation: string;
  isRoadImage: boolean;
  tags: string[];
  model: string;
  analyzedAt: string;
  raw?: {
    detections: Array<{ label: string; confidence: number; bbox: number[] }>;
  };
}

export interface CompletionRecord {
  beforeImages: ImageAsset[];
  afterImages: ImageAsset[];
  notes?: string;
  repairType?: string;
  completedBy?: string;
  completedAt?: string;
  durationHours?: number;
}

export interface Feedback {
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: Role;
  avatar?: string;
  address?: string;
  district?: string;
  location?: GeoPoint;
  status: UserStatus;
  verified: boolean;
  contractor?: {
    specialty?: string;
    teamSize?: number;
    rating?: number;
    completedJobs?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export type SafeUser = Omit<User, "password">;

export interface Complaint {
  id: string;
  reportNumber: string;
  title: string;
  description?: string;
  images: ImageAsset[];
  location: GeoPoint;
  address?: string;
  district?: string;
  type: RoadDamageType;
  status: ComplaintStatus;
  priority: Priority;
  reporter: string;
  assignedContractor?: string;
  aiAnalysis: AIAnalysis | null;
  duplicateOf?: string;
  completion?: CompletionRecord;
  feedback?: Feedback;
  verifiedBy?: string;
  verifiedAt?: string;
  assignedAt?: string;
  startedAt?: string;
  completedAt?: string;
  rejectedReason?: string;
  timestamps: {
    created: string;
    updated: string;
  };
}

export interface NotificationItem {
  id: string;
  user: string;
  type: "complaint" | "ai" | "assignment" | "completion" | "feedback" | "system" | "info";
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  user: string;
  userName?: string;
  complaint?: string;
  complaintNumber?: string;
  description: string;
  createdAt: string;
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DashboardStats {
  totalComplaints: number;
  pendingReview: number;
  verified: number;
  inProgress: number;
  completed: number;
  highPriority: number;
  rejected: number;
  avgCompletionDays: number;
  resolutionRate: number;
  activeContractors: number;
  registeredCitizens: number;
  aiDetectionRate: number;
}

export interface TrendPoint {
  month: string;
  year: number;
  label: string;
  submitted: number;
  verified: number;
  completed: number;
}
