import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Brain, Building2, CheckCircle2, ClipboardList, ShieldCheck, Star } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { GroupedBarChart, SimpleBarChart, DonutChart, RadialGauge, TrendAreaChart } from "@/components/charts";
import { Progress } from "@/components/ui/progress";
import { analyticsApi } from "@/services";
import { STATUS_META, TYPE_META } from "@/constants";
import { titleCase } from "@/lib/utils";
import type { AiAccuracy, DashboardStats, DistrictBreakdown, RepairPerformance } from "@/types";

export default function AnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trends, setTrends] = useState<Array<{ label: string; submitted: number; verified: number; completed: number }>>([]);
  const [districts, setDistricts] = useState<DistrictBreakdown[]>([]);
  const [statusData, setStatusData] = useState<Array<{ status: string; count: number }>>([]);
  const [severityData, setSeverityData] = useState<Array<{ severity: string; count: number }>>([]);
  const [typesData, setTypesData] = useState<Array<{ type: string; count: number }>>([]);
  const [contractors, setContractors] = useState<RepairPerformance[]>([]);
  const [ai, setAi] = useState<AiAccuracy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      analyticsApi.overview(),
      analyticsApi.trends(12),
      analyticsApi.districts(),
      analyticsApi.status(),
      analyticsApi.severity(),
      analyticsApi.types(),
      analyticsApi.contractors(),
      analyticsApi.aiAccuracy(),
    ]).then(([s, t, d, st, se, ty, c, a]) => {
      if (s.status === "fulfilled") setStats(s.value);
      if (t.status === "fulfilled") setTrends(t.value);
      if (d.status === "fulfilled") setDistricts(d.value);
      if (st.status === "fulfilled") setStatusData(st.value);
      if (se.status === "fulfilled") setSeverityData(se.value);
      if (ty.status === "fulfilled") setTypesData(ty.value);
      if (c.status === "fulfilled") setContractors(c.value);
      if (a.status === "fulfilled") setAi(a.value);
      setLoading(false);
    });
  }, []);

  const statusChart = useMemo(() => {
    const palette = ["#2563EB", "#0EA5E9", "#10B981", "#F59E0B", "#EF4444", "#94A3B8", "#8B5CF6"];
    return statusData.map((d, i) => ({
      name: STATUS_META[d.status as keyof typeof STATUS_META]?.label ?? titleCase(d.status),
      value: d.count,
      color: palette[i % palette.length],
    }));
  }, [statusData]);

  const districtChart = useMemo(
    () =>
      districts.map((d) => ({
        label: d.district,
        completed: d.completed,
        pending: d.total - d.completed,
      })),
    [districts]
  );

  const typeChart = useMemo(
    () =>
      typesData.map((t) => ({ label: TYPE_META[t.type as keyof typeof TYPE_META]?.label ?? titleCase(t.type), count: t.count })),
    [typesData]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Deep-dive insights into road-damage reporting, repair and AI performance."
        crumbs={[{ label: "Dashboard", to: "/admin" }, { label: "Analytics" }]}
      />

      {loading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard title="Total complaints" value={stats?.totalComplaints ?? 0} icon={<ClipboardList className="h-5 w-5" />} iconBg="bg-blue-50 text-blue-600" />
          <StatCard title="Completed" value={stats?.completed ?? 0} icon={<CheckCircle2 className="h-5 w-5" />} iconBg="bg-emerald-50 text-emerald-600" />
          <StatCard title="Resolution rate" value={stats?.resolutionRate ?? 0} suffix="%" decimals={1} icon={<BarChart3 className="h-5 w-5" />} iconBg="bg-violet-50 text-violet-600" />
          <StatCard title="Avg repair days" value={stats?.avgCompletionDays ?? 0} icon={<Building2 className="h-5 w-5" />} iconBg="bg-amber-50 text-amber-600" />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>12-month trend</CardTitle>
            <CardDescription>Submitted vs completed reports</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-64" /> : <div className="h-64"><TrendAreaChart data={trends} /></div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI health</CardTitle>
            <CardDescription>Detection model performance</CardDescription>
          </CardHeader>
          <CardContent>
            {loading || !ai ? (
              <Skeleton className="h-56" />
            ) : (
              <div className="space-y-4">
                <RadialGauge value={ai.avgConfidence} label="Avg confidence" color="#8b5cf6" />
                <div className="grid grid-cols-3 gap-3 border-t border-border pt-4 text-center">
                  <div>
                    <p className="text-lg font-bold text-foreground">{ai.samples}</p>
                    <p className="text-[11px] text-muted-foreground">Samples</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground">{Math.round(ai.feedbackSatisfaction)}%</p>
                    <p className="text-[11px] text-muted-foreground">Satisfaction</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground">{ai.highSeverityDetected}</p>
                    <p className="text-[11px] text-muted-foreground">High sev. found</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Status distribution</CardTitle>
            <CardDescription>Current pipeline by status</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-56" /> : <div className="h-56"><DonutChart data={statusChart} /></div>}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>District breakdown</CardTitle>
            <CardDescription>Completed vs pending per district</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-56" /> : <div className="h-56"><GroupedBarChart data={districtChart} /></div>}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Damage types</CardTitle>
            <CardDescription>Most reported road damage</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-56" /> : <div className="h-56"><SimpleBarChart data={typeChart} /></div>}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>District performance</CardTitle>
            <CardDescription>Completion rate and open workload</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-56" />
            ) : (
              <div className="space-y-4">
                {districts.map((d) => {
                  const pct = d.total > 0 ? Math.round((d.completed / d.total) * 100) : 0;
                  return (
                    <div key={d.district}>
                      <div className="mb-1.5 flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">{d.district}</span>
                        <span className="text-xs text-muted-foreground">
                          {d.highPriority} high · {d.inProgress} active · {pct}% done
                        </span>
                      </div>
                      <Progress
                        value={pct}
                        indicatorClassName={pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-primary" : "bg-amber-500"}
                      />
                    </div>
                  );
                })}
                {districts.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No district data yet.</p>}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contractor performance</CardTitle>
          <CardDescription>Repair speed, ratings and on-time delivery</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-40" />
          ) : (
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="pb-2.5 pr-4 font-medium">Contractor</th>
                    <th className="pb-2.5 pr-4 font-medium">Completed</th>
                    <th className="pb-2.5 pr-4 font-medium">Avg repair</th>
                    <th className="pb-2.5 pr-4 font-medium">On-time</th>
                    <th className="pb-2.5 font-medium">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {contractors.map((c) => (
                    <tr key={c.contractorId}>
                      <td className="py-3 pr-4">
                        <span className="flex items-center gap-2 font-medium text-foreground">
                          <ShieldCheck className="h-4 w-4 text-primary" /> {c.name}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">{c.completed}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{Math.round(c.avgRepairDays)}d</td>
                      <td className="py-3 pr-4 text-muted-foreground">{Math.round(c.onTime)}%</td>
                      <td className="py-3">
                        <span className="inline-flex items-center gap-1 font-medium text-foreground">
                          <Star className="h-3.5 w-3.5 text-amber-400" /> {c.avgRating ? c.avgRating.toFixed(1) : "—"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {contractors.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">No contractor data yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
