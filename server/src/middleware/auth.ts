import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError.js";
import { verifyToken } from "../utils/token.js";
import { getUsersStore } from "../data/store.js";
import type { Role } from "../types/index.js";

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      throw ApiError.unauthorized("Missing or invalid authorization header");
    }
    const token = header.slice(7);
    const payload = verifyToken(token);

    const user = await getUsersStore().findById(payload.sub);
    if (!user) throw ApiError.unauthorized("Account no longer exists");

    if (user.status === "suspended") {
      throw ApiError.forbidden("Your account has been suspended");
    }

    const { password: _pw, ...safeUser } = user;
    req.user = safeUser;
    next();
  } catch (err) {
    next(err instanceof ApiError ? err : ApiError.unauthorized("Invalid or expired token"));
  }
};

export const authorize =
  (...roles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden("You do not have permission to perform this action"));
    }
    next();
  };
