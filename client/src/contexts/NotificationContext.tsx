import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { notificationApi } from "@/services";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";
import type { NotificationItem } from "@/types";

interface NotificationContextValue {
  unread: number;
  notifications: NotificationItem[];
  refresh: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  clearAll: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const { info } = useToast();
  const [unread, setUnread] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const seenIds = useRef<Set<string>>(new Set());

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await notificationApi.list(30);
      setNotifications(res);
      setUnread(res.filter((n) => !n.read).length);
    } catch {
      /* noop */
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;

    const poll = async () => {
      try {
        const list = await notificationApi.list(30);
        if (!active) return;
        setNotifications(list);
        const unreadCount = list.filter((n) => !n.read).length;
        setUnread(unreadCount);
        list.forEach((n) => {
          if (!n.read && !seenIds.current.has(n.id)) {
            seenIds.current.add(n.id);
            info(n.title, n.message);
          }
        });
      } catch {
        /* noop */
      }
    };

    void poll();
    const interval = window.setInterval(poll, 20000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [isAuthenticated, info]);

  const markRead = useCallback(async (id: string) => {
    await notificationApi.markRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnread((u) => Math.max(0, u - 1));
  }, []);

  const markAllRead = useCallback(async () => {
    await notificationApi.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
  }, []);

  const clearAll = useCallback(async () => {
    await notificationApi.clearAll();
    setNotifications([]);
    setUnread(0);
  }, []);

  const value = useMemo<NotificationContextValue>(
    () => ({ unread, notifications, refresh, markRead, markAllRead, clearAll }),
    [unread, notifications, refresh, markRead, markAllRead, clearAll]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = (): NotificationContextValue => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
};
