import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError.js";
import { isProd } from "../config/env.js";

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      details: err.details,
    });
  }

  if (err instanceof Error && "code" in err && (err as { code?: string }).code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      success: false,
      message: "File is too large. Maximum allowed size is 10MB.",
    });
  }

  if (err instanceof Error && "name" in err && err.name === "MulterError") {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  if (err instanceof SyntaxError) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON payload",
    });
  }

  console.error("[ServerError]", err);

  return res.status(500).json({
    success: false,
    message: isProd ? "Internal server error" : (err instanceof Error ? err.message : "Unknown error"),
  });
};
