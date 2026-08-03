import type { Response } from "express";

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: Record<string, unknown>;
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = "Success",
  statusCode = 200,
  meta?: Record<string, unknown>
) => {
  const body: ApiResponse<T> = { success: true, message, data };
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
};
