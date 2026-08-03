import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Brain,
  Building2,
  CheckCircle2,
  ClipboardList,
  Clock,
  Eye,
  Gauge,
  ShieldAlert,
  Truck,
  Users,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/stat-card";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { ComplaintTable } from "@/components/complaints/complaint-table";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendAreaChart, DonutChart, RadialGauge } from "@/components/charts";
import { complaintApi, analyticsApi, userApi } from "@/services";
import type { Complaint, DashboardStats } from "@/types";

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trends, setTrends] = useState<Array<{ month: string; year: number; label: string; submitted: number; verified: number; completed: number }>>([]);
  const [recent, setRecent] = useState<Complaint[]>([]);
  const [activity, setActivity] = useState<Array<{ id: string; action: string; description: string; createdAt: string }>>([]);
  const [contractors, setContractors] = useState<Array<{ id: string; name: string; assigned: number; inProgress: number; completed: number; status: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      analyticsApi.overview(),
      analyticsApi.trends(12),
      complaintApi.list({ page: 1, pageSize: 6 }),
      analyticsApi.activity(12),
      userApi.contractorStats(),
    ]).then(([s, t, r, a, c]) => {
      if (s.status === "fulfilled") setStats(s.value);
      if (t.status === "fulfilled") setTrends(t.value);
      if (r.status === "fulfilled") setRecent(r.value.data);
      if (a.status === "fulfilled") setActivity(a.value);
      if (c.status === "fulfilled") setContractors(c.value);
      setLoading(false);
    });
  }, []);

  const statusData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: "Pending review", value: stats.pendingReview, color: "#94a3b8" },
      { name: "Verified", value: stats.verified, color: "#0ea5e9" },
      { name: "In progress", value: stats.inProgress, color: "#f59e0b" },
      { name: "Completed", value: stats.completed, color: "#22c55e" },
      { name: "Rejected", value: stats.rejected, color: "#ef4444" },
    ].filter((d) => d.value > 0);
  }, [stats]);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Command center</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            City-wide road-damage operations, AI insights and contractor performance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/admin/complaints">
            <Button variant="outline" className="gap-2">
              <ClipboardList className="h-4 w-4" /> All complaints
            </Button>
          </Link>
          <Link to="/admin/analytics">
            <Button className="gap-2">
              <Activity className="h-4 w-4" /> Analytics
            </Button>
          </Link>
        </div>
      </motion.div>

      {loading || !stats ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard title="Total complaints" value={stats.totalComplaints} icon={<ClipboardList className="h-5 w-5" />} iconBg="bg-blue-50 text-blue-600" />
          <StatCard title="Pending review" value={stats.pendingReview} icon={<Eye className="h-5 w-5" />} iconBg="bg-amber-50 text-amber-600" />
          <StatCard title="In progress" value={stats.inProgress} icon={<Gauge className="h-5 w-5" />} iconBg="bg-orange-50 text-orange-600" />
          <StatCard title="Completed" value={stats.completed} icon={<CheckCircle2 className="h-5 w-5" />} iconBg="bg-emerald-50 text-emerald-600" />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard title="AI detection rate" value={stats?.aiDetectionRate ?? 0} suffix="%" icon={<Brain className="h-5 w-5" />} iconBg="bg-violet-50 text-violet-600" decimals={1} />
        <StatCard title="Resolution rate" value={stats?.resolutionRate ?? 0} suffix="%" icon={<CheckCircle2 className="h-5 w-5" />} iconBg="bg-emerald-50 text-emerald-600" decimals={1} />
        <StatCard title="High priority" value={stats?.highPriority ?? 0} icon={<ShieldAlert className="h-5 w-5" />} iconBg="bg-rose-50 text-rose-600" />
        <StatCard title="Registered citizens" value={stats?.registeredCitizens ?? 0} icon={<Users className="h-5 w-5" />} iconBg="bg-sky-50 text-sky-600" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Reports trend</CardTitle>
              <CardDescription>Submitted vs completed over the last year</CardDescription>
            </div>
            <Link to="/admin/analytics" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              Analytics <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64" />
            ) : trends.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">No trend data yet.</div>
            ) : (
              <div className="h-64">
                <TrendAreaChart data={trends} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pipeline</CardTitle>
            <CardDescription>Complaints by current status</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-56" />
            ) : statusData.length === 0 ? (
              <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">No data.</div>
            ) : (
              <div className="h-56">
                <DonutChart data={statusData} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Recent complaints</CardTitle>
              <CardDescription>Latest submissions across the city</CardDescription>
            </div>
            <Link to="/admin/complaints">
              <Button variant="ghost" size="sm">
                View all <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-48" />
            ) : (
              <ComplaintTable complaints={recent} basePath="/admin/complaints" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Live activity</CardTitle>
            <CardDescription>What's happening right now</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-56" />
            ) : (
              <ActivityFeed items={activity} />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Contractor workload</CardTitle>
              <CardDescription>Assigned jobs per active team</CardDescription>
            </div>
            <Link to="/admin/contractors">
              <Button variant="ghost" size="sm">
                Manage contractors <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-40" />
            ) : (
              <div className="space-y-3">
                {contractors.map((c) => {
                  const total = c.assigned + c.inProgress + c.completed;
                  const pct = total > 0 ? Math.round((c.completed / total) * 100) : 0;
                  return (
                    <button
                      key={c.id}
                      onClick={() => navigate("/admin/contractors")}
                      className="block w-full rounded-lg border border-border p-3 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <Truck className="h-4 w-4 text-primary" /> {c.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {c.inProgress} active · {c.completed} done
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="mt-1.5 text-[11px] text-muted-foreground">Completion {pct}% · {c.status}</p>
                    </button>
                  );
                })}
                {contractors.length === 0 && (
                  <p className="py-8 text-center text-sm text-muted-foreground">No contractors registered yet.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Performance</CardTitle>
            <CardDescription>Key operational metrics</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col justify-center gap-5">
            <RadialGauge value={stats?.resolutionRate ?? 0} label="Resolution rate" color="#10b981" />
            <div className="grid grid-cols-2 gap-4 border-t border-border pt-4 text-center">
              <div>
                <p className="flex items-center justify-center gap-1 text-2xl font-bold text-foreground">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {stats?.avgCompletionDays ?? 0}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Avg. repair days</p>
              </div>
              <div>
                <p className="flex items-center justify-center gap-1 text-2xl font-bold text-foreground">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  {stats?.activeContractors ?? 0}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Active contractors</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {stats && stats.highPriority > 0 && (
        <Card className="border-rose-200 bg-gradient-to-r from-rose-50 to-transparent">
          <CardContent className="flex flex-col items-start justify-between gap-3 p-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-rose-700">{stats.highPriority} high-priority complaints need attention</p>
                <p className="text-xs text-rose-600">Prioritize verification and contractor assignment for critical damage.</p>
              </div>
            </div>
            <Link to="/admin/complaints?priority=high">
              <Button size="sm" variant="danger" className="gap-2">
                Review now <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
