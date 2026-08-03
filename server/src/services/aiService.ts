import type { AIAnalysis, RoadDamageType, Severity } from "../types/index.js";
import { nowIso } from "../utils/datetime.js";
import { config } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * AI Road Damage Detection Service
 *
 * Delegates to the FastAPI + YOLOv8 microservice (`ml-service`). The
 * microservice runs real object detection and returns damage detections
 * with bounding boxes; this module adapts its response to the platform's
 * `AIAnalysis` shape.
 */

export interface AnalyzeResult {
  analysis: AIAnalysis;
  processed: boolean;
  provider: "remote";
}

interface MlDetection {
  class: string;
  label: string;
  class_id: number;
  confidence: number;
  bbox: [number, number, number, number];
  area_ratio: number;
}

interface MlPrediction {
  detected: string;
  severity: Severity;
  confidence: number;
  recommendation: string;
  is_road_image: boolean;
  tags: string[];
  model: string;
  analyzed_at: string;
  detections: MlDetection[];
}

interface MlHealth {
  status: string;
  provider?: string;
  model?: string;
  classes?: string[];
  weights?: string;
  error?: string;
}

const imageMimeType = (filename?: string): string => {
  const ext = path.extname(filename ?? "").toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  return "image/jpeg";
};

const isRoadDamageType = (value: string): value is RoadDamageType =>
  ["pothole", "crack", "rutting", "depression", "surface_damage", "edge_damage", "sinkhole", "other"].includes(
    value
  );

export const analyzeImage = async (file: {
  path?: string;
  filename?: string;
  originalname?: string;
}): Promise<AnalyzeResult> => {
  if (!file.path) throw ApiError.badRequest("Uploaded image is missing from disk");

  const buffer = await readFile(file.path);
  const form = new FormData();
  const name = file.filename ?? file.originalname ?? "image.jpg";
  form.append("image", new Blob([buffer], { type: imageMimeType(name) }), name);

  let res: Response;
  try {
    res = await fetch(`${config.mlServiceUrl}/predict`, {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(config.mlServiceTimeout),
    });
  } catch {
    throw new ApiError(
      503,
      "AI service unavailable",
      "The road-damage detection service is not reachable. Start it with `npm run ml:dev`."
    );
  }

  if (!res.ok) {
    const detail = (await res.text()).slice(0, 300);
    throw new ApiError(res.status, "AI analysis failed", detail || "The ML service returned an error.");
  }

  const ml = (await res.json()) as MlPrediction;
  const detected = isRoadDamageType(ml.detected) ? ml.detected : "other";

  const analysis: AIAnalysis = {
    detected,
    severity: ml.severity,
    confidence: ml.confidence,
    recommendation: ml.recommendation,
    isRoadImage: ml.is_road_image,
    tags: ml.tags ?? [],
    model: ml.model,
    analyzedAt: ml.analyzed_at ?? nowIso(),
    raw: {
      detections: (ml.detections ?? []).map((d) => ({
        label: d.label,
        confidence: d.confidence,
        bbox: d.bbox,
      })),
    },
  };

  return { analysis, processed: true, provider: "remote" };
};

export const getMlServiceHealth = async (): Promise<MlHealth> => {
  try {
    const res = await fetch(`${config.mlServiceUrl}/health`, {
      signal: AbortSignal.timeout(Math.min(config.mlServiceTimeout, 5000)),
    });
    if (!res.ok) return { status: "error", error: `ML service responded with HTTP ${res.status}` };
    return (await res.json()) as MlHealth;
  } catch (err) {
    return { status: "unreachable", error: err instanceof Error ? err.message : "ML service unreachable" };
  }
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
