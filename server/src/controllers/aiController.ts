import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { sendSuccess } from "../utils/response.js";
import { analyzeImage, getMlServiceHealth } from "../services/aiService.js";
import { toPublicUrl } from "../middleware/upload.js";

export const analyze = asyncHandler(async (req: Request, res: Response) => {
  const file = (req.file as Express.Multer.File | undefined) ?? (req.files as Express.Multer.File[] | undefined)?.[0];
  if (!file) throw ApiError.badRequest("An image is required for analysis");

  const result = await analyzeImage(file);
  sendSuccess(
    res,
    {
      ...result.analysis,
      imageUrl: toPublicUrl(file.filename),
    },
    "AI analysis complete",
    200
  );
});

export const health = asyncHandler(async (_req: Request, res: Response) => {
  const upstream = await getMlServiceHealth();

  if (upstream.status !== "ok") {
    sendSuccess(
      res,
      {
        status: upstream.status,
        provider: "yolov8",
        model: upstream.model ?? null,
        error: upstream.error ?? "ML service unreachable",
      },
      "AI service health"
    );
    return;
  }

  sendSuccess(res, {
    status: "ok",
    model: upstream.model ?? "yolov8s-rdd2022-v1",
    provider: "yolov8",
    capabilities: ["pothole", "crack", "surface_damage"],
  });
});
