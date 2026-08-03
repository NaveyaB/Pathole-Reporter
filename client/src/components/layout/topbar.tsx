import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, CheckCheck, LogOut, Menu, Search, Settings, UserRound } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { timeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";

const TYPE_DOT: Record<string, string> = {
  complaint: "bg-blue-500",
  ai: "bg-violet-500",
  assignment: "bg-indigo-500",
  completion: "bg-emerald-500",
  feedback: "bg-fuchsia-500",
  system: "bg-rose-500",
  info: "bg-slate-400",
};

export const Topbar = ({ onMenuClick }: { onMenuClick?: () => void }) => {
  const { user, logout } = useAuth();
  const { unread, markAllRead } = useNotifications();
  const navigate = useNavigate();
  const [, setSearchOpen] = useState(false);

  const home = user?.role === "admin" || user?.role === "super_admin" ? "/admin" : user?.role === "contractor" ? "/contractor" : "/dashboard";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-white/85 px-4 backdrop-blur-xl sm:px-6">
      <button onClick={onMenuClick} className="rounded-md p-2 text-muted-foreground hover:bg-muted lg:hidden" aria-label="Open menu">
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden flex-1 md:block md:max-w-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search complaints, reports…" className="bg-muted/50 pl-9" onFocus={() => setSearchOpen(true)} onBlur={() => setSearchOpen(false)} />
        </div>
      </div>

      <div className="flex flex-1 items-center gap-1 md:hidden">
        <button
          onClick={() => setSearchOpen(true)}
          className="flex flex-1 items-center gap-2 rounded-lg bg-muted/60 px-3 py-2 text-sm text-muted-foreground"
        >
          <Search className="h-4 w-4" /> Search…
        </button>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Notifications */}
        <NotificationsPanel unread={unread} markAllRead={markAllRead} />

        {/* User menu */}
        <DropdownMenu
          align="end"
          width="w-60"
          trigger={
            <button className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-muted" aria-label="Account menu">
              <Avatar name={user?.name} size="sm" />
              <span className="hidden text-sm font-medium text-foreground sm:block">{user?.name.split(" ")[0]}</span>
            </button>
          }
          items={[
            { label: "View profile", icon: <UserRound className="h-4 w-4" />, onClick: () => navigate("/profile") },
            { label: "Settings", icon: <Settings className="h-4 w-4" />, onClick: () => navigate("/settings") },
            { label: "Back to home", icon: <span className="h-4 w-4" />, onClick: () => navigate(home), separator: true },
            { label: "Sign out", icon: <LogOut className="h-4 w-4" />, onClick: handleLogout, danger: true },
          ]}
        />
      </div>
    </header>
  );
};

const NotificationsPanel = ({ unread, markAllRead }: { unread: number; markAllRead: () => Promise<void> }) => {
  const { notifications } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
          open ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
        aria-label="Open notifications"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-border bg-white shadow-popover sm:w-96">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="text-sm font-semibold">Notifications</p>
              <div className="flex items-center gap-1">
                {unread > 0 && (
                  <button onClick={() => void markAllRead()} className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10">
                    <CheckCheck className="h-3.5 w-3.5" /> Mark all read
                  </button>
                )}
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto scrollbar-thin">
              {notifications.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">No notifications yet</p>
              ) : (
                notifications.slice(0, 10).map((n) => (
                  <Link
                    key={n.id}
                    to={n.link ?? "/notifications"}
                    onClick={() => setOpen(false)}
                    className={cn("flex gap-3 border-b border-border/60 px-4 py-3 transition-colors last:border-0 hover:bg-muted/50", !n.read && "bg-primary/[0.03]")}
                  >
                    <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", TYPE_DOT[n.type] ?? "bg-slate-400", n.read && "opacity-30")} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">{n.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.message}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground/70">{timeAgo(n.createdAt)}</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
            <Link
              to="/notifications"
              onClick={() => setOpen(false)}
              className="block border-t border-border bg-muted/40 px-4 py-2.5 text-center text-xs font-medium text-primary hover:bg-muted"
            >
              View all notifications
            </Link>
          </div>
        </>
      )}
    </div>
  );
};
