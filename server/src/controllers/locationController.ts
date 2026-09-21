import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import {
  parseCoordinate,
  validateLocation,
  findNearbyDuplicate,
} from "../services/geoService.js";

export const validate = asyncHandler(async (req: Request, res: Response) => {
  const { lat, lng, placeId } = req.body as Record<string, unknown>;

  const result = await validateLocation({
    lat: parseCoordinate(lat, "lat"),
    lng: parseCoordinate(lng, "lng"),
    placeId: typeof placeId === "string" && placeId ? placeId : undefined,
  });

  sendSuccess(res, result, result.valid ? "Location is valid" : "Location could not be validated");
});

export const duplicateCheck = asyncHandler(async (req: Request, res: Response) => {
  const { lat, lng, thresholdMeters } = req.body as Record<string, unknown>;

  const duplicate = await findNearbyDuplicate(
    parseCoordinate(lat, "lat"),
    parseCoordinate(lng, "lng"),
    typeof thresholdMeters === "number" && thresholdMeters > 0 ? thresholdMeters : undefined
  );

  sendSuccess(res, duplicate, "Duplicate check complete");
});