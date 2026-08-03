import { useMemo, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  PlusCircle,
  ListChecks,
  Map as MapIcon,
  Bell,
  UserRound,
  Settings,
  ClipboardList,
  Users,
  Building2,
  BarChart3,
  FileText,
  Wrench,
  X,
  Route,
  ShieldCheck,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import type { Role } from "@/types";

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
  end?: boolean;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

const SECTIONS: Record<Role, NavSection[]> = {
  citizen: [
    {
      items: [
        { label: "Dashboard", to: "/dashboard", icon: <LayoutDashboard className="h-4.5 w-4.5 h-[18px] w-[18px]" />, end: true },
        { label: "Report Damage", to: "/report", icon: <PlusCircle className="h-4.5 w-4.5 h-[18px] w-[18px]" /> },
        { label: "My Complaints", to: "/complaints", icon: <ListChecks className="h-4.5 w-4.5 h-[18px] w-[18px]" /> },
        { label: "Live Map", to: "/map", icon: <MapIcon className="h-4.5 w-4.5 h-[18px] w-[18px]" /> },
      ],
    },
    {
      title: "Account",
      items: [
        { label: "Notifications", to: "/notifications", icon: <Bell className="h-4.5 w-4.5 h-[18px] w-[18px]" /> },
        { label: "Profile", to: "/profile", icon: <UserRound className="h-4.5 w-4.5 h-[18px] w-[18px]" /> },
        { label: "Settings", to: "/settings", icon: <Settings className="h-4.5 w-4.5 h-[18px] w-[18px]" /> },
      ],
    },
  ],
  contractor: [
    {
      items: [
        { label: "Dashboard", to: "/contractor", icon: <LayoutDashboard className="h-4.5 w-4.5 h-[18px] w-[18px]" />, end: true },
        { label: "My Jobs", to: "/contractor/jobs", icon: <Wrench className="h-4.5 w-4.5 h-[18px] w-[18px]" /> },
        { label: "Work Map", to: "/contractor/map", icon: <Route className="h-4.5 w-4.5 h-[18px] w-[18px]" /> },
      ],
    },
    {
      title: "Account",
      items: [
        { label: "Notifications", to: "/notifications", icon: <Bell className="h-4.5 w-4.5 h-[18px] w-[18px]" /> },
        { label: "Profile", to: "/profile", icon: <UserRound className="h-4.5 w-4.5 h-[18px] w-[18px]" /> },
        { label: "Settings", to: "/settings", icon: <Settings className="h-4.5 w-4.5 h-[18px] w-[18px]" /> },
      ],
    },
  ],
  admin: [
    {
      title: "Municipality",
      items: [
        { label: "Overview", to: "/admin", icon: <LayoutDashboard className="h-4.5 w-4.5 h-[18px] w-[18px]" />, end: true },
        { label: "Complaints", to: "/admin/complaints", icon: <ListChecks className="h-4.5 w-4.5 h-[18px] w-[18px]" /> },
        { label: "Live Map", to: "/admin/map", icon: <MapIcon className="h-4.5 w-4.5 h-[18px] w-[18px]" /> },
        { label: "Analytics", to: "/admin/analytics", icon: <BarChart3 className="h-4.5 w-4.5 h-[18px] w-[18px]" /> },
        { label: "Reports", to: "/admin/reports", icon: <FileText className="h-4.5 w-4.5 h-[18px] w-[18px]" /> },
      ],
    },
    {
      title: "Management",
      items: [
        { label: "Contractors", to: "/admin/contractors", icon: <Building2 className="h-4.5 w-4.5 h-[18px] w-[18px]" /> },
        { label: "Citizens", to: "/admin/citizens", icon: <Users className="h-4.5 w-4.5 h-[18px] w-[18px]" /> },
      ],
    },
    {
      title: "Account",
      items: [
        { label: "Notifications", to: "/notifications", icon: <Bell className="h-4.5 w-4.5 h-[18px] w-[18px]" /> },
        { label: "Profile", to: "/profile", icon: <UserRound className="h-4.5 w-4.5 h-[18px] w-[18px]" /> },
        { label: "Settings", to: "/settings", icon: <Settings className="h-4.5 w-4.5 h-[18px] w-[18px]" /> },
      ],
    },
  ],
  super_admin: [],
};

const getHome = (role: Role): string =>
  role === "admin" || role === "super_admin" ? "/admin" : role === "contractor" ? "/contractor" : "/dashboard";

export const Logo = ({ compact }: { compact?: boolean }) => (
  <Link to="/" className="flex items-center gap-2.5">
    <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary shadow-glow">
      <svg viewBox="0 0 64 64" className="h-6 w-6" fill="none">
        <path d="M18 40h28v6a2 2 0 0 1-2 2H20a2 2 0 0 1-2-2v-6Z" fill="#F59E0B" />
        <path d="M16 38c0-8 6-14 14-14h4c8 0 14 6 14 14H16Z" fill="#fff" />
        <circle cx="26" cy="33" r="3" fill="#2563EB" />
        <circle cx="38" cy="33" r="3" fill="#2563EB" />
        <circle cx="32" cy="33" r="3.5" fill="#EF4444" />
        <circle cx="32" cy="44" r="2.5" fill="#10B981" />
      </svg>
    </div>
    {!compact && (
      <div className="leading-tight">
        <p className="text-[15px] font-bold text-foreground">Smart Pothole</p>
        <p className="text-[11px] font-medium tracking-wide text-primary">Reporter</p>
      </div>
    )}
  </Link>
);

const SidebarContent = () => {
  const { role } = useAuth();
  const location = useLocation();
  const sections = useMemo(() => (role ? SECTIONS[role] ?? [] : []), [role]);
  const home = role ? getHome(role) : "/";

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-5">
        <Logo />
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4 scrollbar-thin">
        <div className="space-y-6">
          {sections.map((section, idx) => (
            <div key={idx}>
              {section.title && (
                <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {section.title}
                </p>
              )}
              <nav className="space-y-0.5">
                {section.items.map((item) => {
                  const active = item.end ? location.pathname === item.to : location.pathname.startsWith(item.to);
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={cn(
                        "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <span className={cn("transition-transform group-hover:scale-110", active && "text-primary")}>{item.icon}</span>
                      {item.label}
                      {active && <motion.span layoutId="sidebar-active" className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border p-3">
        <Link
          to={home}
          className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
        >
          <UserMenuCard />
        </Link>
      </div>
    </div>
  );
};

const UserMenuCard = () => {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar name={user.name} size="md" />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
        <p className="truncate text-xs capitalize text-muted-foreground">{user.role.replace("_", " ")}</p>
      </div>
    </div>
  );
};

interface SidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export const Sidebar = ({ mobileOpen: mobileOpenProp, setMobileOpen: setMobileOpenProp }: SidebarProps = {}) => {
  const [internal, setInternal] = useState(false);
  const mobileOpen = mobileOpenProp ?? internal;
  const setMobileOpen = setMobileOpenProp ?? setInternal;
  const location = useLocation();

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-border bg-sidebar lg:block">
        <SidebarContent />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-white shadow-xl lg:hidden"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute right-3 top-4 rounded-md p-1.5 text-muted-foreground hover:bg-muted"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
