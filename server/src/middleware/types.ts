import type { Request } from "express";
import type { Role, SafeUser } from "../types/index.js";

declare global {
  namespace Express {
    interface Request {
      user?: SafeUser;
      fileUrl?: string;
    }
  }
}

export {};

export const ROLES: Role[] = ["citizen", "contractor", "admin", "super_admin"];

export const isAdmin = (role: Role): boolean => role === "admin" || role === "super_admin";

export const requireRole = (allowed: Role[]) => (role: Role) => allowed.includes(role);
