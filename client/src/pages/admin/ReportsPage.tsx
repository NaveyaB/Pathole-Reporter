import { useEffect, useMemo, useState } from "react";
import { FileDown, FileText, Loader2, Printer, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { useToast } from "@/contexts/ToastContext";
import { analyticsApi, complaintApi } from "@/services";
import { STATUS_META, TYPE_META } from "@/constants";
import { formatDate, formatDateTime, titleCase } from "@/lib/utils";
import type { Complaint, DashboardStats, DistrictBreakdown } from "@/types";

const RANGES = [
  { value: "all", label: "All time" },
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
  { value: "365", label: "Last year" },
];

export default function ReportsPage() {
  const { success, error } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [districts, setDistricts] = useState<DistrictBreakdown[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [range, setRange] = useState("all");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    Promise.allSettled([
      analyticsApi.overview(),
      analyticsApi.districts(),
      complaintApi.list({ page: 1, pageSize: 50 }),
    ]).then(([s, d, c]) => {
      if (s.status === "fulfilled") setStats(s.value);
      if (d.status === "fulfilled") setDistricts(d.value);
      if (c.status === "fulfilled") setComplaints(c.value.data);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    if (range === "all") return complaints;
    const days = Number(range);
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return complaints.filter((c) => new Date(c.timestamps.created).getTime() >= cutoff);
  }, [complaints, range]);

  const statusSummary = useMemo(() => {
    const counts: Record<string, number> = {};
    filtered.forEach((c) => {
      counts[c.status] = (counts[c.status] ?? 0) + 1;
    });
    return counts;
  }, [filtered]);

  const exportCSV = () => {
    setExporting(true);
    try {
      const headers = [
        "Report Number",
        "Title",
        "Type",
        "Status",
        "Priority",
        "Severity",
        "District",
        "Latitude",
        "Longitude",
        "Reporter",
        "Created",
        "Completed",
        "AI Confidence",
      ];
      const rows = filtered.map((c) => [
        c.reportNumber,
        `"${(c.title ?? "").replace(/"/g, '""')}"`,
        TYPE_META[c.type]?.label ?? c.type,
        STATUS_META[c.status]?.label ?? c.status,
        titleCase(c.priority),
        c.aiAnalysis ? titleCase(c.aiAnalysis.severity) : "N/A",
        c.district ?? "",
        c.location.lat.toFixed(5),
        c.location.lng.toFixed(5),
        c.reporterUser?.name ?? "",
        formatDateTime(c.timestamps.created),
        c.completedAt ? formatDateTime(c.completedAt) : "",
        c.aiAnalysis ? `${c.aiAnalysis.confidence.toFixed(1)}%` : "",
      ]);
      const csv = [headers, ...rows]
        .map((r) => r.join(","))
        .join("\n");
      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `road-damage-report-${range}-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      success("CSV exported", `${filtered.length} records downloaded.`);
    } catch {
      error("Export failed", "Could not generate the CSV file.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Generate operational summaries and export complaint data."
        crumbs={[{ label: "Dashboard", to: "/admin" }, { label: "Reports" }]}
        actions={
          <>
            <Select value={range} onChange={setRange} options={RANGES} className="w-40" />
            <Button variant="outline" onClick={() => window.print()} className="gap-2">
              <Printer className="h-4 w-4" /> Print
            </Button>
            <Button onClick={exportCSV} loading={exporting} className="gap-2">
              <FileDown className="h-4 w-4" /> Export CSV
            </Button>
          </>
        }
      />

      <div className="space-y-6 print:space-y-4">
        <Card>
          <CardHeader className="flex-row items-center gap-3 space-y-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Executive summary</CardTitle>
              <CardDescription>Generated {formatDate(new Date().toISOString())} · report period: {RANGES.find((r) => r.value === range)?.label}</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-32" />
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                {[
                  { label: "Reports", value: stats?.totalComplaints ?? 0 },
                  { label: "In this range", value: filtered.length },
                  { label: "Completed", value: filtered.filter((c) => c.status === "completed").length },
                  { label: "Open", value: filtered.filter((c) => !["completed", "rejected"].includes(c.status)).length },
                  { label: "High priority", value: filtered.filter((c) => c.priority === "high" || c.priority === "critical").length },
                  { label: "AI-confirmed", value: filtered.filter((c) => c.aiAnalysis && c.aiAnalysis.confidence >= 80).length },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg border border-border bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="mt-1 text-xl font-bold text-foreground">{item.value}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2 print:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Status distribution</CardTitle>
              <CardDescription>Complaints in the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-48" />
              ) : (
                <div className="space-y-3">
                  {Object.entries(statusSummary).length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">No complaints in this period.</p>
                  ) : (
                    Object.entries(statusSummary)
                      .sort((a, b) => b[1] - a[1])
                      .map(([status, count]) => {
                        const meta = STATUS_META[status as keyof typeof STATUS_META];
                        const pct = filtered.length ? Math.round((count / filtered.length) * 100) : 0;
                        return (
                          <div key={status} className="flex items-center gap-3">
                            <Badge variant="outline" className={`${meta.bg} w-32 justify-start`}>{meta.label}</Badge>
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                              <div className={`h-full rounded-full ${meta.dot}`} style={{ width: `${pct}%` }} />
                            </div>
                            <span className="w-10 text-right text-sm font-semibold text-foreground">{count}</span>
                          </div>
                        );
                      })
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>District summary</CardTitle>
              <CardDescription>Workload and completion by district</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-48" />
              ) : (
                <div className="overflow-x-auto scrollbar-thin">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="pb-2 pr-3 font-medium">District</th>
                        <th className="pb-2 pr-3 font-medium">Total</th>
                        <th className="pb-2 pr-3 font-medium">Pending</th>
                        <th className="pb-2 pr-3 font-medium">Active</th>
                        <th className="pb-2 font-medium">Done</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {districts.map((d) => (
                        <tr key={d.district}>
                          <td className="py-2.5 pr-3 font-medium text-foreground">{d.district}</td>
                          <td className="py-2.5 pr-3 text-muted-foreground">{d.total}</td>
                          <td className="py-2.5 pr-3 text-muted-foreground">{d.pending}</td>
                          <td className="py-2.5 pr-3 text-muted-foreground">{d.inProgress}</td>
                          <td className="py-2.5 text-emerald-600">{d.completed}</td>
                        </tr>
                      ))}
                      {districts.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-muted-foreground">No district data.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Exportable data ({filtered.length} complaints)</CardTitle>
              <CardDescription>Complaints included in the CSV export for this period</CardDescription>
            </div>
            <Button size="sm" variant="outline" onClick={exportCSV} disabled={exporting} className="gap-2">
              {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Download CSV
            </Button>
          </CardHeader>
          <CardContent>
            <div className="max-h-80 overflow-y-auto rounded-lg border border-border scrollbar-thin">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-muted/80 backdrop-blur">
                  <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-3 py-2 font-medium">Report</th>
                    <th className="px-3 py-2 font-medium">Title</th>
                    <th className="hidden px-3 py-2 font-medium sm:table-cell">District</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="hidden px-3 py-2 font-medium md:table-cell">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.slice(0, 50).map((c) => (
                    <tr key={c.id}>
                      <td className="px-3 py-2 font-mono text-xs font-semibold text-primary">{c.reportNumber}</td>
                      <td className="max-w-[220px] truncate px-3 py-2 font-medium text-foreground">{c.title}</td>
                      <td className="hidden px-3 py-2 text-muted-foreground sm:table-cell">{c.district ?? "—"}</td>
                      <td className="px-3 py-2"><Badge variant="outline" className={STATUS_META[c.status]?.bg}>{STATUS_META[c.status]?.label}</Badge></td>
                      <td className="hidden px-3 py-2 text-muted-foreground md:table-cell">{formatDate(c.timestamps.created)}</td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">No complaints in this period.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
