import type { NextFunction, Request, Response } from "express";
import { ApiError } from "./ApiError.js";

type Handler = (
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<unknown>;

export const asyncHandler =
  (fn: Handler) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export const notFoundHandler = (_req: Request, _res: Response, next: NextFunction) => {
  next(ApiError.notFound("The requested route does not exist"));
};
