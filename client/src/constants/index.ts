import type { ComplaintStatus, Priority, RoadDamageType, Severity } from "@/types";

export const DISTRICT_NAMES = [
  "Banjara Hills",
  "Hitec City",
  "Gachibowli",
  "Old City",
  "Secunderabad",
  "Madhapur",
  "Ameerpet",
  "Kukatpally",
];

export const STATUS_META: Record<
  ComplaintStatus,
  { label: string; color: string; bg: string; dot: string; order: number }
> = {
  submitted: {
    label: "Submitted",
    color: "text-slate-600",
    bg: "bg-slate-100 text-slate-700 border-slate-200",
    dot: "bg-slate-400",
    order: 0,
  },
  under_review: {
    label: "Under Review",
    color: "text-sky-600",
    bg: "bg-sky-50 text-sky-700 border-sky-200",
    dot: "bg-sky-500",
    order: 1,
  },
  verified: {
    label: "Verified",
    color: "text-blue-600",
    bg: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
    order: 2,
  },
  assigned: {
    label: "Assigned",
    color: "text-indigo-600",
    bg: "bg-indigo-50 text-indigo-700 border-indigo-200",
    dot: "bg-indigo-500",
    order: 3,
  },
  in_progress: {
    label: "In Progress",
    color: "text-amber-600",
    bg: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
    order: 4,
  },
  completed: {
    label: "Completed",
    color: "text-emerald-600",
    bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    order: 5,
  },
  rejected: {
    label: "Rejected",
    color: "text-rose-600",
    bg: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
    order: 6,
  },
};

export const STATUS_ORDER: ComplaintStatus[] = [
  "submitted",
  "under_review",
  "verified",
  "assigned",
  "in_progress",
  "completed",
];

export const PRIORITY_META: Record<Priority, { label: string; className: string }> = {
  low: { label: "Low", className: "bg-slate-100 text-slate-600 border-slate-200" },
  medium: { label: "Medium", className: "bg-sky-50 text-sky-700 border-sky-200" },
  high: { label: "High", className: "bg-orange-50 text-orange-700 border-orange-200" },
  critical: { label: "Critical", className: "bg-rose-50 text-rose-700 border-rose-200" },
};

export const SEVERITY_META: Record<Severity, { label: string; className: string; ring: string; hex: string }> = {
  low: { label: "Low", className: "bg-slate-100 text-slate-600 border-slate-200", ring: "ring-slate-400", hex: "#94a3b8" },
  medium: { label: "Medium", className: "bg-sky-50 text-sky-700 border-sky-200", ring: "ring-sky-400", hex: "#0ea5e9" },
  high: { label: "High", className: "bg-orange-50 text-orange-700 border-orange-200", ring: "ring-orange-400", hex: "#f59e0b" },
  critical: { label: "Critical", className: "bg-rose-50 text-rose-700 border-rose-200", ring: "ring-rose-500", hex: "#ef4444" },
};

export const TYPE_META: Record<RoadDamageType, { label: string; icon: string }> = {
  pothole: { label: "Pothole", icon: "hole" },
  crack: { label: "Crack", icon: "crack" },
  rutting: { label: "Rutting", icon: "ruts" },
  depression: { label: "Depression", icon: "depression" },
  surface_damage: { label: "Surface Damage", icon: "surface" },
  edge_damage: { label: "Edge Damage", icon: "edge" },
  sinkhole: { label: "Sinkhole", icon: "sinkhole" },
  other: { label: "Other", icon: "other" },
};

export const STATUS_OPTIONS: ComplaintStatus[] = [
  "submitted",
  "under_review",
  "verified",
  "assigned",
  "in_progress",
  "completed",
  "rejected",
];

export const PRIORITY_OPTIONS: Priority[] = ["low", "medium", "high", "critical"];

export const SEVERITY_OPTIONS: Severity[] = ["low", "medium", "high", "critical"];

export const TYPE_OPTIONS: RoadDamageType[] = [
  "pothole",
  "crack",
  "rutting",
  "depression",
  "surface_damage",
  "edge_damage",
  "sinkhole",
  "other",
];

export const REPAIR_TYPES = [
  { value: "asphalt-patching", label: "Asphalt Patching" },
  { value: "full-depth-repair", label: "Full-Depth Repair" },
  { value: "cold-mix-patching", label: "Cold-Mix Patching" },
  { value: "surface-treatment", label: "Surface Treatment" },
  { value: "slab-replacement", label: "Slab Replacement" },
];

export const CITY_CENTER: { lat: number; lng: number } = { lat: 17.4239, lng: 78.4738 };
