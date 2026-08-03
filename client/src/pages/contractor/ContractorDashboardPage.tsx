import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Clock,
  Hammer,
  MapPin,
  Play,
  Star,
  Timer,
  Truck,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { ComplaintTable } from "@/components/complaints/complaint-table";
import { ComplaintMap, type MapPoint } from "@/components/maps/complaint-map";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuth } from "@/contexts/AuthContext";
import { complaintApi } from "@/services";
import { STATUS_META } from "@/constants";
import { cn } from "@/lib/utils";
import type { Complaint } from "@/types";

export default function ContractorDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    complaintApi
      .list({ contractor: user.id, page: 1, pageSize: 50 })
      .then((res) => setJobs(res.data))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, [user]);

  const stats = useMemo(() => {
    const active = jobs.filter((j) => j.status === "assigned");
    const inProgress = jobs.filter((j) => j.status === "in_progress");
    const completed = jobs.filter((j) => j.status === "completed");
    const highPriority = jobs.filter((j) => j.status !== "completed" && (j.priority === "high" || j.priority === "critical"));
    return { active: active.length, inProgress: inProgress.length, completed: completed.length, highPriority: highPriority.length };
  }, [jobs]);

  const mapPoints: MapPoint[] = useMemo(
    () =>
      jobs
        .filter((j) => j.status !== "completed")
        .map((j) => ({
          id: j.id,
          reportNumber: j.reportNumber,
          title: j.title,
          location: j.location,
          district: j.district,
          status: j.status,
          priority: j.priority,
          severity: j.aiAnalysis?.severity,
          type: j.type,
          createdAt: j.timestamps.created,
        })),
    [jobs]
  );

  const nextJob = useMemo(() => {
    const ordered = ["assigned", "in_progress"];
    return [...jobs].sort((a, b) => {
      const pa = ordered.indexOf(a.status) >= 0 ? ordered.indexOf(a.status) : 9;
      const pb = ordered.indexOf(b.status) >= 0 ? ordered.indexOf(b.status) : 9;
      return pa - pb;
    })[0];
  }, [jobs]);

  const avgRating = user?.contractor?.rating;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Hi {user?.name.split(" ")[0]} 👷</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your assigned repairs, active jobs and completed work — all in one place.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/contractor/jobs">
            <Button variant="outline" className="gap-2">
              <ClipboardList className="h-4 w-4" /> All jobs
            </Button>
          </Link>
          <Link to="/contractor/map">
            <Button className="gap-2">
              <MapPin className="h-4 w-4" /> Job map
            </Button>
          </Link>
        </div>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard title="Ready to start" value={stats.active} icon={<Timer className="h-5 w-5" />} iconBg="bg-indigo-50 text-indigo-600" />
          <StatCard title="In progress" value={stats.inProgress} icon={<Play className="h-5 w-5" />} iconBg="bg-amber-50 text-amber-600" />
          <StatCard title="Completed" value={stats.completed} icon={<CheckCircle2 className="h-5 w-5" />} iconBg="bg-emerald-50 text-emerald-600" />
          <StatCard title="High priority" value={stats.highPriority} icon={<Hammer className="h-5 w-5" />} iconBg="bg-rose-50 text-rose-600" />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Active jobs</CardTitle>
              <CardDescription>Jobs assigned to your team</CardDescription>
            </div>
            <Link to="/contractor/jobs">
              <Button variant="ghost" size="sm">
                View all <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-56" />
            ) : (
              <ComplaintTable complaints={jobs.slice(0, 6)} basePath="/contractor/jobs" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team performance</CardTitle>
            <CardDescription>Your profile metrics</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-56" />
            ) : (
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-blue-700 text-white">
                    <Truck className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{user?.contractor?.completedJobs ?? stats.completed}</p>
                    <p className="text-xs text-muted-foreground">Lifetime repairs</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 border-t border-border pt-4">
                  <div className="rounded-lg bg-muted/40 p-3 text-center">
                    <p className="flex items-center justify-center gap-1 text-xl font-bold text-foreground">
                      <Star className="h-4 w-4 text-amber-400" /> {avgRating ? avgRating.toFixed(1) : "—"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">Rating</p>
                  </div>
                  <div className="rounded-lg bg-muted/40 p-3 text-center">
                    <p className="flex items-center justify-center gap-1 text-xl font-bold text-foreground">
                      <Clock className="h-4 w-4 text-muted-foreground" /> {user?.contractor?.teamSize ?? "—"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">Team size</p>
                  </div>
                </div>
                {user?.contractor?.specialty && (
                  <div className="rounded-lg border border-border p-3 text-sm">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Specialty</p>
                    <p className="mt-1 font-medium text-foreground">{user.contractor.specialty}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Open job locations</CardTitle>
            <CardDescription>Your assigned jobs that are not yet completed</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64" />
            ) : (
              <ComplaintMap
                points={mapPoints}
                height={300}
                onSelect={(p) => navigate(`/contractor/jobs/${p.reportNumber}`)}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Next up</CardTitle>
            <CardDescription>Recommended next job</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-48" />
            ) : nextJob ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-primary">{nextJob.reportNumber}</span>
                  <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium", STATUS_META[nextJob.status]?.bg)}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_META[nextJob.status]?.dot)} />
                    {STATUS_META[nextJob.status]?.label}
                  </span>
                </div>
                <p className="text-sm font-semibold text-foreground">{nextJob.title}</p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" /> {nextJob.district ?? "Unknown"} · {nextJob.address ?? "No address"}
                </p>
                {nextJob.aiAnalysis && (
                  <div className="flex items-center gap-2 rounded-lg bg-violet-50 px-3 py-2 text-xs font-medium text-violet-700">
                    <Hammer className="h-3.5 w-3.5" />
                    {nextJob.aiAnalysis.recommendation}
                  </div>
                )}
                <Link to={`/contractor/jobs/${nextJob.reportNumber}`}>
                  <Button className="w-full" size="sm">
                    Open job <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ) : (
              <EmptyState
                icon={<ClipboardList className="h-6 w-6" />}
                title="No pending jobs"
                description="You're all caught up. New assignments will appear here."
                className="border-0 bg-transparent"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
