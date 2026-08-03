import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  ListChecks,
  MapPin,
  PlusCircle,
  Timer,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/stat-card";
import { ComplaintTable } from "@/components/complaints/complaint-table";
import { ComplaintMap, type MapPoint } from "@/components/maps/complaint-map";
import { Skeleton } from "@/components/ui/skeleton";
import { DonutChart } from "@/components/charts";
import { useAuth } from "@/contexts/AuthContext";
import { complaintApi } from "@/services";
import { SEVERITY_META, STATUS_META } from "@/constants";
import { cn } from "@/lib/utils";
import type { Complaint } from "@/types";

export default function CitizenDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    complaintApi
      .mine()
      .then(setComplaints)
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const total = complaints.length;
    const inProgress = complaints.filter((c) => ["assigned", "in_progress"].includes(c.status)).length;
    const completed = complaints.filter((c) => c.status === "completed").length;
    const pending = complaints.filter((c) => ["submitted", "under_review", "verified"].includes(c.status)).length;
    return { total, inProgress, completed, pending };
  }, [complaints]);

  const statusData = useMemo(() => {
    const counts = new Map<string, number>();
    complaints.forEach((c) => counts.set(c.status, (counts.get(c.status) ?? 0) + 1));
    return Array.from(counts.entries()).map(([status, value]) => ({
      name: STATUS_META[status as keyof typeof STATUS_META]?.label ?? status,
      value,
      color: SEVERITY_META[status as keyof typeof SEVERITY_META]?.hex,
    }));
  }, [complaints]);

  const mapPoints: MapPoint[] = useMemo(
    () =>
      complaints.slice(0, 120).map((c) => ({
        id: c.id,
        reportNumber: c.reportNumber,
        title: c.title,
        location: c.location,
        district: c.district,
        status: c.status,
        priority: c.priority,
        severity: c.aiAnalysis?.severity,
        type: c.type,
        createdAt: c.timestamps.created,
      })),
    [complaints]
  );

  const recent = complaints.slice(0, 5);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {greeting}, {user?.name.split(" ")[0]} 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here's what's happening with your road-damage reports.
          </p>
        </div>
        <Link to="/report">
          <Button size="lg" className="gap-2">
            <PlusCircle className="h-4 w-4" /> Report new damage
          </Button>
        </Link>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard title="My reports" value={stats.total} icon={<ClipboardList className="h-5 w-5" />} iconBg="bg-blue-50 text-blue-600" />
          <StatCard title="Pending review" value={stats.pending} icon={<Timer className="h-5 w-5" />} iconBg="bg-amber-50 text-amber-600" />
          <StatCard title="In progress" value={stats.inProgress} icon={<AlertTriangle className="h-5 w-5" />} iconBg="bg-orange-50 text-orange-600" />
          <StatCard title="Repaired" value={stats.completed} icon={<CheckCircle2 className="h-5 w-5" />} iconBg="bg-emerald-50 text-emerald-600" />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>My complaints map</CardTitle>
              <CardDescription>Your reports across the city</CardDescription>
            </div>
            <Link to="/map" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              Open map <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-72" />
            ) : (
              <ComplaintMap
                points={mapPoints}
                height={300}
                onSelect={(p) => navigate(`/complaints/${p.reportNumber}`)}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status breakdown</CardTitle>
            <CardDescription>All your complaints by status</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-56" />
            ) : statusData.length > 0 ? (
              <div className="h-56">
                <DonutChart data={statusData} />
              </div>
            ) : (
              <div className="flex h-56 flex-col items-center justify-center text-center">
                <MapPin className="h-8 w-8 text-muted-foreground/40" />
                <p className="mt-2 text-sm text-muted-foreground">No complaints yet</p>
                <Button className="mt-3" size="sm" onClick={() => navigate("/report")}>
                  Report damage
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Recent complaints</CardTitle>
            <CardDescription>Your latest reports and their status</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/complaints")}>
            View all <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-40" />
          ) : (
            <ComplaintTable complaints={recent} basePath="/complaints" />
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
            <CardDescription>Common tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: "Report a pothole", desc: "Photo + location in 60s", icon: <PlusCircle className="h-4 w-4" />, to: "/report" },
              { label: "View live map", desc: "Explore city-wide complaints", icon: <MapPin className="h-4 w-4" />, to: "/map" },
              { label: "My notifications", desc: "Latest status updates", icon: <ListChecks className="h-4 w-4" />, to: "/notifications" },
            ].map((a) => (
              <Link
                key={a.to}
                to={a.to}
                className="group flex items-center gap-3 rounded-xl border border-border p-3 transition-all hover:border-primary/30 hover:bg-primary/5"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform group-hover:scale-110">
                  {a.icon}
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-medium text-foreground">{a.label}</span>
                  <span className="block text-xs text-muted-foreground">{a.desc}</span>
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>How repairs are tracked</CardTitle>
            <CardDescription>Every report follows a transparent, accountable process</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recent.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Submit your first report and watch it move through verification, assignment and repair.
                </p>
              ) : (
                recent.map((c) => (
                  <Link
                    key={c.id}
                    to={`/complaints/${c.reportNumber}`}
                    className="flex items-center gap-4 rounded-xl border border-border p-3 transition-all hover:border-primary/30 hover:shadow-sm"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{c.title}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {c.reportNumber} · {c.district ?? "Unknown district"}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
                        STATUS_META[c.status]?.bg
                      )}
                    >
                      <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_META[c.status]?.dot)} />
                      {STATUS_META[c.status]?.label}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
