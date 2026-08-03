import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { sendSuccess } from "../utils/response.js";
import { generateId, nowIso, subtractDays } from "../utils/datetime.js";
import { getUsersStore } from "../data/store.js";
import { sanitizeUser, signToken } from "../utils/token.js";
import { notify } from "../services/notificationService.js";
import type { Role, User } from "../types/index.js";

const ROLES: Role[] = ["citizen", "contractor", "admin", "super_admin"];

const toPublic = (user: User) => {
  const { password: _pw, ...safe } = user;
  return safe;
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, phone, password, role, district, address, location } = req.body as Record<string, unknown>;

  if (!name || !email || !password) {
    throw ApiError.badRequest("Name, email and password are required");
  }
  if (typeof password !== "string" || password.length < 6) {
    throw ApiError.badRequest("Password must be at least 6 characters");
  }

  const roleName = (role as Role) ?? "citizen";
  if (!ROLES.includes(roleName) || roleName === "admin" || roleName === "super_admin") {
    throw ApiError.badRequest("Invalid role for registration");
  }

  const existing = await getUsersStore().findOne({ email: String(email).toLowerCase() });
  if (existing) throw ApiError.conflict("An account with this email already exists");

  const hashed = await bcrypt.hash(String(password), 10);
  const now = nowIso();
  const user: User = {
    id: generateId("usr"),
    name: String(name),
    email: String(email).toLowerCase(),
    password: hashed,
    phone: phone ? String(phone) : undefined,
    role: roleName,
    district: district ? String(district) : undefined,
    address: address ? String(address) : undefined,
    location: location as User["location"],
    status: "active",
    verified: true,
    createdAt: now,
    updatedAt: now,
  };

  await getUsersStore().create(user);

  await notify({
    userId: user.id,
    type: "info",
    title: "Welcome to Smart Pothole Reporter",
    message: "Thank you for joining. Report road damage in under 60 seconds and track repairs in real time.",
  });

  const token = signToken(toPublic(user));
  sendSuccess(res, { user: toPublic(user), token }, "Account created successfully", 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) throw ApiError.badRequest("Email and password are required");

  const user = await getUsersStore().findOne({ email: String(email).toLowerCase() });
  if (!user) throw ApiError.unauthorized("Invalid email or password");

  const valid = await bcrypt.compare(String(password), user.password);
  if (!valid) throw ApiError.unauthorized("Invalid email or password");

  if (user.status === "suspended") {
    throw ApiError.forbidden("This account has been suspended. Contact the municipality.");
  }

  const token = signToken(toPublic(user));
  sendSuccess(res, { user: toPublic(user), token }, "Logged in successfully");
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, { user: req.user });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw ApiError.unauthorized();

  const { name, phone, address, district, location, avatar } = req.body as Record<string, unknown>;

  const user = await getUsersStore().updateById(userId, {
    $set: {
      ...(name ? { name: String(name) } : {}),
      ...(phone !== undefined ? { phone: phone ? String(phone) : undefined } : {}),
      ...(address !== undefined ? { address: address ? String(address) : undefined } : {}),
      ...(district !== undefined ? { district: district ? String(district) : undefined } : {}),
      ...(location !== undefined ? { location: location as User["location"] } : {}),
      ...(avatar !== undefined ? { avatar: avatar ? String(avatar) : undefined } : {}),
      updatedAt: nowIso(),
    },
  });
  if (!user) throw ApiError.notFound("User not found");

  sendSuccess(res, { user: toPublic(user) }, "Profile updated");
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw ApiError.unauthorized();

  const { currentPassword, newPassword } = req.body as { currentPassword?: string; newPassword?: string };
  if (!currentPassword || !newPassword) throw ApiError.badRequest("Current and new password are required");
  if (String(newPassword).length < 6) throw ApiError.badRequest("New password must be at least 6 characters");

  const user = await getUsersStore().findById(userId);
  if (!user) throw ApiError.notFound("User not found");

  const valid = await bcrypt.compare(String(currentPassword), user.password);
  if (!valid) throw ApiError.badRequest("Current password is incorrect");

  const hashed = await bcrypt.hash(String(newPassword), 10);
  await getUsersStore().updateById(userId, { $set: { password: hashed, updatedAt: nowIso() } });

  sendSuccess(res, null, "Password updated successfully");
});

export const getDemoAccounts = asyncHandler(async (_req: Request, res: Response) => {
  const now = nowIso();
  sendSuccess(res, {
    accounts: [
      { role: "citizen", email: "citizen@demo.com", password: "demo1234", hint: "Track your complaints, give feedback" },
      { role: "contractor", email: "contractor@demo.com", password: "demo1234", hint: "View assigned jobs, update repair status" },
      { role: "admin", email: "admin@demo.com", password: "demo1234", hint: "Verify, assign and monitor all complaints" },
    ],
    seededAt: now,
  });
});
