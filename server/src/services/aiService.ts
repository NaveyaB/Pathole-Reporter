import type { AIAnalysis, RoadDamageType, Severity } from "../types/index.js";
import { nowIso } from "../utils/datetime.js";

/**
 * AI Road Damage Detection Service
 *
 * Production implementation uses a Python (FastAPI + YOLOv8) microservice that
 * returns detection bounding boxes. This in-process engine mirrors the same
 * contract so the rest of the platform is fully decoupled from the ML layer.
 */

export interface AnalyzeResult {
  analysis: AIAnalysis;
  processed: boolean;
  provider: "mock-v2" | "remote";
}

const damageTypes: RoadDamageType[] = [
  "pothole",
  "crack",
  "rutting",
  "depression",
  "surface_damage",
  "edge_damage",
  "sinkhole",
];

const severityMap: Record<number, Severity> = {
  0: "low",
  1: "low",
  2: "medium",
  3: "medium",
  4: "high",
  5: "high",
};

const recommendations: Record<Severity, string> = {
  low: "Schedule routine inspection. Low-priority patching recommended within 30 days.",
  medium: "Plan repair within the next 2 weeks. Monitor drainage to prevent expansion.",
  high: "Immediate repair required. Potential risk to vehicles and two-wheelers.",
  critical: "Urgent intervention required. Isolate area with signage and repair within 24 hours.",
};

/** Deterministic hash so the same image always yields the same prediction. */
const hashString = (input: string): number => {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
};

const predict = (seed: number) => {
  const type = damageTypes[seed % damageTypes.length];
  const severity = severityMap[(seed >> 2) % 6];
  const confidence = 87 + (seed % 12);
  return { type, severity, confidence };
};

export const analyzeImage = async (
  file: { originalname: string; filename?: string; path?: string },
  extraSeed = 0
): Promise<AnalyzeResult> => {
  const rawSeed = hashString(file.originalname || file.filename || "image") + extraSeed;
  const { type, severity, confidence } = predict(rawSeed);

  const tags = [
    type.replace("_", " "),
    severity === "critical" ? "hazard" : severity === "high" ? "high-risk" : "maintenance",
    rawSeed % 3 === 0 ? "water-damage" : rawSeed % 3 === 1 ? "wear-and-tear" : "drainage-issue",
  ];

  return {
    provider: "mock-v2",
    processed: true,
    analysis: {
      detected: type,
      severity,
      confidence,
      recommendation: recommendations[severity],
      isRoadImage: true,
      tags,
      model: "yolov8-road-damage-v2",
      analyzedAt: nowIso(),
      raw: {
        detections: [
          { label: type.replace("_", " "), confidence: confidence / 100, bbox: [120, 160, 240, 300] },
          { label: "road-surface", confidence: 0.93, bbox: [40, 40, 400, 360] },
        ],
      },
    },
  };
};

/** Returns a duplicate-match score (0-100) against existing complaints in the same district. */
export const findDuplicates = (
  location: { lat: number; lng: number },
  existing: Array<{ id: string; location: { lat: number; lng: number } }>
): { score: number; matchId?: string } => {
  const radiusMeters = (lat: number, lng: number) => {
    const R = 6371000;
    const dLat = ((lat - location.lat) * Math.PI) / 180;
    const dLng = ((lng - location.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((location.lat * Math.PI) / 180) *
        Math.cos((lat * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const nearest = existing
    .map((c) => ({ ...c, distance: radiusMeters(c.location.lat, c.location.lng) }))
    .sort((a, b) => a.distance - b.distance)[0];

  if (!nearest) return { score: 0 };
  if (nearest.distance > 60) return { score: Math.round(Math.max(0, 30 - nearest.distance / 4)) };

  const proximity = Math.max(0, 100 - nearest.distance * 1.5);
  return { score: Math.round(Math.min(98, proximity)), matchId: nearest.id };
};
