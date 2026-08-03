import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const formatDate = (iso?: string, opts?: Intl.DateTimeFormatOptions): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", opts ?? { day: "numeric", month: "short", year: "numeric" });
};

export const formatDateTime = (iso?: string): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export const timeAgo = (iso?: string): string => {
  if (!iso) return "—";
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
};

export const formatNumber = (n: number): string => {
  if (Number.isNaN(n)) return "0";
  return n.toLocaleString("en-US");
};

export const formatPercent = (n: number): string => `${Math.round(n)}%`;

export const formatDuration = (hours?: number): string => {
  if (hours == null) return "—";
  if (hours < 24) return `${Math.round(hours)}h`;
  const days = hours / 24;
  return `${days % 1 === 0 ? days : days.toFixed(1)}d`;
};

export const titleCase = (s: string): string =>
  s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export const initials = (name?: string): string =>
  (name ?? "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export const truncate = (s: string, len = 60): string =>
  s.length > len ? `${s.slice(0, len)}…` : s;
