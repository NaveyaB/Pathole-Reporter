import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import { getNotificationsStore } from "../data/store.js";
import { nowIso } from "../utils/datetime.js";

export const listNotifications = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const limit = Math.min(100, parseInt(req.query.limit as string) || 30);
  const data = await getNotificationsStore().find(
    { user: userId },
    { sort: { createdAt: -1 as const }, limit }
  );
  const unread = await getNotificationsStore().count({ user: userId, read: false });
  sendSuccess(res, data, "Notifications fetched", 200, { unread });
});

export const markRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params;
  const updated = await getNotificationsStore().updateOne(
    { id, user: userId },
    { $set: { read: true } }
  );
  if (!updated) {
    return sendSuccess(res, null, "Notification not found");
  }
  sendSuccess(res, updated, "Marked as read");
});

export const markAllRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const all = await getNotificationsStore().find({ user: userId, read: false });
  for (const n of all) {
    await getNotificationsStore().updateById(n.id, { $set: { read: true } });
  }
  sendSuccess(res, null, "All notifications marked as read");
});

export const clearAll = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const all = await getNotificationsStore().find({ user: userId });
  for (const n of all) {
    await getNotificationsStore().deleteById(n.id);
  }
  sendSuccess(res, null, "Notifications cleared");
});
