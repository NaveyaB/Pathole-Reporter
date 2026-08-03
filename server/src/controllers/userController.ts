import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { sendSuccess } from "../utils/response.js";
import { generateId, nowIso } from "../utils/datetime.js";
import { getComplaintsStore, getUsersStore } from "../data/store.js";
import { notify } from "../services/notificationService.js";
import type { Role, User } from "../types/index.js";

const toPublic = (user: User) => {
  const { password: _pw, ...safe } = user;
  return safe;
};

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const role = (req.query.role as string) || undefined;
  const search = (req.query.search as string) || "";
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize as string) || 20));

  const filter: Record<string, unknown> = {};
  if (role) filter.role = role;
  if (search) {
    const regex = new RegExp(search, "i");
    const all = await getUsersStore().all();
    const filtered = all.filter(
      (u) => regex.test(u.name) || regex.test(u.email) || regex.test(u.district ?? "")
    );
    const total = filtered.length;
    const data = filtered
      .slice((page - 1) * pageSize, page * pageSize)
      .map(toPublic);
    return sendSuccess(res, data, "Users fetched", 200, {
      page, pageSize, total, totalPages: Math.ceil(total / pageSize),
    });
  }

  const [data, total] = await Promise.all([
    getUsersStore().find(filter as never, { sort: { createdAt: -1 as const }, skip: (page - 1) * pageSize, limit: pageSize }),
    getUsersStore().count(filter as never),
  ]);

  sendSuccess(res, data.map(toPublic), "Users fetched", 200, {
    page, pageSize, total, totalPages: Math.ceil(total / pageSize),
  });
});

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, phone, role, district, address, contractor } = req.body as Record<string, unknown>;

  if (!name || !email || !password) throw ApiError.badRequest("Name, email and password are required");
  const roleName = (role as Role) ?? "citizen";
  if (!["citizen", "contractor", "admin"].includes(roleName)) {
    throw ApiError.badRequest("Invalid role");
  }

  const existing = await getUsersStore().findOne({ email: String(email).toLowerCase() });
  if (existing) throw ApiError.conflict("A user with this email already exists");

  const user: User = {
    id: generateId("usr"),
    name: String(name),
    email: String(email).toLowerCase(),
    password: await bcrypt.hash(String(password), 10),
    phone: phone ? String(phone) : undefined,
    role: roleName,
    district: district ? String(district) : undefined,
    address: address ? String(address) : undefined,
    contractor: contractor as User["contractor"],
    status: "active",
    verified: true,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  await getUsersStore().create(user);
  sendSuccess(res, { user: toPublic(user) }, "User created", 201);
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  const { name, phone, role, district, address, status, contractor } = req.body as Record<string, unknown>;

  const user = await getUsersStore().updateById(id, {
    $set: {
      ...(name ? { name: String(name) } : {}),
      ...(phone !== undefined ? { phone: phone ? String(phone) : undefined } : {}),
      ...(role ? { role: role as Role } : {}),
      ...(district !== undefined ? { district: district ? String(district) : undefined } : {}),
      ...(address !== undefined ? { address: address ? String(address) : undefined } : {}),
      ...(status ? { status: status as User["status"] } : {}),
      ...(contractor !== undefined ? { contractor: contractor as User["contractor"] } : {}),
      updatedAt: nowIso(),
    },
  });
  if (!user) throw ApiError.notFound("User not found");
  sendSuccess(res, { user: toPublic(user) }, "User updated");
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  if (id === req.user?.id) throw ApiError.badRequest("You cannot delete your own account");
  const deleted = await getUsersStore().deleteById(id);
  if (!deleted) throw ApiError.notFound("User not found");
  sendSuccess(res, null, "User deleted");
});

export const getContractorStats = asyncHandler(async (req: Request, res: Response) => {
  const contractors = await getUsersStore().find({ role: "contractor" });
  const complaints = await getComplaintsStore().find({});

  const stats = contractors.map((c) => {
    const assigned = complaints.filter((x) => x.assignedContractor === c.id);
    return {
      id: c.id,
      name: c.name,
      email: c.email,
      contractor: c.contractor,
      district: c.district,
      assigned: assigned.length,
      inProgress: assigned.filter((x) => x.status === "assigned" || x.status === "in_progress").length,
      completed: assigned.filter((x) => x.status === "completed").length,
      status: c.status,
      createdAt: c.createdAt,
    };
  });
  sendSuccess(res, stats, "Contractor stats fetched");
});
