export type Role = "citizen" | "contractor" | "admin" | "super_admin";

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

export type ComplaintSource = "citizen" | "ai" | "imported" | "seed";

export interface GeoPoint {
  lat: number;
  lng: number;
}

/** Server-approved pothole location. Stored before submission. */
export interface ValidatedLocation {
  valid: boolean;
  inTamilNadu: boolean;
  boundaryMethod: "geocode" | "polygon" | "bbox" | "unresolved";
  lat: number;
  lng: number;
  formattedAddress?: string;
  district?: string;
  locality?: string;
  city?: string;
  state?: string;
  placeId?: string;
  reason?: string;
  confirmed?: boolean;
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
  phone?: string;
  role: Role;
  avatar?: string;
  address?: string;
  district?: string;
  location?: GeoPoint;
  status: "active" | "suspended";
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

export interface ContractorStats {
  id: string;
  name: string;
  email: string;
  contractor?: User["contractor"];
  district?: string;
  assigned: number;
  inProgress: number;
  completed: number;
  status: string;
  createdAt: string;
}

export interface Complaint {
  id: string;
  reportNumber: string;
  title: string;
  description?: string;
  images: ImageAsset[];
  location: GeoPoint;
  /** Citizen-entered exact address of the damage (required). */
  exactAddress?: string;
  address?: string;
  formattedAddress?: string;
  placeId?: string;
  locality?: string;
  city?: string;
  district?: string;
  source?: ComplaintSource;
  reporterLocation?: GeoPoint;
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
  timestamps: { created: string; updated: string };
  reporterUser?: { id: string; name: string; phone?: string; email?: string };
  contractorUser?: { id: string; name: string; phone?: string; contractor?: User["contractor"] };
  duplicate?: Complaint | null;
}

export interface MapComplaint {
  id: string;
  reportNumber: string;
  title: string;
  location: GeoPoint;
  district?: string;
  status: ComplaintStatus;
  priority: Priority;
  severity?: Severity;
  type: RoadDamageType;
  createdAt: string;
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

export interface DistrictBreakdown {
  district: string;
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  highPriority: number;
  completionRate: number;
}

export interface RepairPerformance {
  contractorId: string;
  name: string;
  completed: number;
  avgRepairDays: number;
  avgRating: number;
  onTime: number;
}

export interface AiAccuracy {
  avgConfidence: number;
  samples: number;
  feedbackSatisfaction: number;
  highSeverityDetected: number;
}
