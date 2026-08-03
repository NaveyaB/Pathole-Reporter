import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Bell, BellOff, CheckCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotifications } from "@/contexts/NotificationContext";
import { useToast } from "@/contexts/ToastContext";
import { timeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { NotificationItem } from "@/types";

const TYPE_STYLES: Record<NotificationItem["type"], { dot: string; label: string }> = {
  complaint: { dot: "bg-blue-500", label: "Complaint" },
  ai: { dot: "bg-violet-500", label: "AI" },
  assignment: { dot: "bg-indigo-500", label: "Assignment" },
  completion: { dot: "bg-emerald-500", label: "Completion" },
  feedback: { dot: "bg-fuchsia-500", label: "Feedback" },
  system: { dot: "bg-slate-400", label: "System" },
  info: { dot: "bg-sky-500", label: "Info" },
};

export default function NotificationsPage() {
  const { notifications, markRead, markAllRead, clearAll, refresh } = useNotifications();
  const { success } = useToast();
  const [tab, setTab] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void refresh().finally(() => setLoading(false));
  }, [refresh]);

  const filtered = useMemo(() => {
    if (tab === "unread") return notifications.filter((n) => !n.read);
    return notifications;
  }, [notifications, tab]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAll = async () => {
    await markAllRead();
    success("All marked as read", "You're all caught up.");
  };

  const handleClearAll = async () => {
    await clearAll();
    success("Notifications cleared", "Your inbox is now empty.");
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Notifications"
        description="Status updates, assignments and system messages."
        crumbs={[{ label: "Home", to: "/dashboard" }, { label: "Notifications" }]}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={handleMarkAll} disabled={unreadCount === 0}>
              <CheckCheck className="h-4 w-4" /> Mark all read
            </Button>
            <Button variant="ghost" size="sm" onClick={handleClearAll} disabled={notifications.length === 0} className="text-muted-foreground">
              <Trash2 className="h-4 w-4" /> Clear all
            </Button>
          </>
        }
      />

      <Tabs
        tabs={[
          { value: "all", label: "All" },
          { value: "unread", label: "Unread", badge: unreadCount },
        ]}
        value={tab}
        onValueChange={setTab}
        className="mb-5 w-fit"
      />

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={unreadCount === 0 ? <BellOff className="h-6 w-6" /> : <Bell className="h-6 w-6" />}
              title={tab === "unread" ? "No unread notifications" : "No notifications yet"}
              description="You'll be notified here when something changes with your reports."
              className="m-4"
            />
          ) : (
            <ul className="divide-y divide-border">
              {filtered.map((n, i) => {
                const meta = TYPE_STYLES[n.type] ?? TYPE_STYLES.info;
                const body = (
                  <div className="flex items-start gap-3.5">
                    <span className={cn("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full", meta.dot)} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className={cn("text-sm", n.read ? "text-muted-foreground" : "font-semibold text-foreground")}>
                          {n.title}
                        </p>
                        <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(n.createdAt)}</span>
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground">{n.message}</p>
                      {n.link && (
                        <span className="mt-1.5 inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          {n.type === "completion" || n.type === "assignment" ? "View report" : "View details"}
                        </span>
                      )}
                    </div>
                    {!n.read && (
                      <button
                        onClick={() => void markRead(n.id)}
                        className="rounded-md p-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
                      >
                        <CheckCheck className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                );
                return (
                  <motion.li
                    key={n.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.4) }}
                    className={cn("px-4 py-3.5 sm:px-5", !n.read && "bg-primary/[0.03]")}
                  >
                    {n.link ? (
                      <Link to={n.link} className="block" onClick={() => void markRead(n.id)}>
                        {body}
                      </Link>
                    ) : (
                      body
                    )}
                  </motion.li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {!loading && filtered.length > 0 && (
        <div className="mt-4 flex justify-center">
          <Button variant="ghost" size="sm" onClick={() => void refresh()}>
            <Bell className="mr-1.5 h-4 w-4" /> Refresh
          </Button>
        </div>
      )}
    </div>
  );
}
