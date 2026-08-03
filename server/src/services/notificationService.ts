import { getNotificationsStore } from "../data/store.js";
import { generateId, nowIso } from "../utils/datetime.js";
import type { NotificationItem } from "../types/index.js";

interface NotifyInput {
  userId: string;
  type: NotificationItem["type"];
  title: string;
  message: string;
  link?: string;
}

export const notify = async (input: NotifyInput): Promise<NotificationItem> => {
  const notification: NotificationItem = {
    id: generateId("ntf"),
    user: input.userId,
    type: input.type,
    title: input.title,
    message: input.message,
    link: input.link,
    read: false,
    createdAt: nowIso(),
  };
  await getNotificationsStore().create(notification);
  return notification;
};

export const notifyMany = async (inputs: NotifyInput[]): Promise<void> => {
  for (const input of inputs) {
    await notify(input);
  }
};
