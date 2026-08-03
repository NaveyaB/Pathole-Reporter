import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Filter, Layers, Maximize2, Minimize2, LocateFixed } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ComplaintMap, severityLegend, type MapPoint } from "@/components/maps/complaint-map";
import { PageHeader } from "@/components/shared/page-header";
import { complaintApi } from "@/services";
import { DISTRICT_NAMES, SEVERITY_OPTIONS, STATUS_OPTIONS, STATUS_META, SEVERITY_META } from "@/constants";
import { titleCase, timeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { MapComplaint } from "@/types";

const toOptions = (values: string[]) => [
  { value: "", label: "All" },
  ...values.map((v) => ({ value: v, label: titleCase(v) })),
];

export default function MapExplorerPage() {
  const navigate = useNavigate();
  const [points, setPoints] = useState<MapPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [district, setDistrict] = useState("");
  const [severity, setSeverity] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [selected, setSelected] = useState<MapComplaint | null>(null);

  useEffect(() => {
    setLoading(true);
    complaintApi
      .map({
        status: status || undefined,
        district: district || undefined,
        severity: severity || undefined,
      })
      .then(setPoints)
      .catch(() => setPoints([]))
      .finally(() => setLoading(false));
  }, [status, district, severity]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    points.forEach((p) => {
      c[p.status] = (c[p.status] ?? 0) + 1;
    });
    return c;
  }, [points]);

  const handleSelect = (p: MapPoint) => {
    setSelected(p);
    if (expanded) return;
  };

  return (
    <div className="flex h-[calc(100dvh-4.5rem)] flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">City map</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Live view of road-damage reports across the city{loading ? "" : ` — ${points.length} on screen`}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={status} onChange={setStatus} options={toOptions(STATUS_OPTIONS)} placeholder="Status" className="w-36" />
          <Select value={district} onChange={setDistrict} options={toOptions(DISTRICT_NAMES)} placeholder="District" className="w-40" />
          <Select value={severity} onChange={setSeverity} options={toOptions(SEVERITY_OPTIONS)} placeholder="Severity" className="w-32" />
          <Button variant="outline" size="sm" onClick={() => setExpanded((e) => !e)}>
            {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            {expanded ? "Collapse" : "Expand"}
          </Button>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[300px_1fr]">
        <Card className="min-h-0 overflow-hidden">
          <CardContent className="flex h-full flex-col gap-4 overflow-y-auto p-4 scrollbar-thin">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Filter className="h-4 w-4 text-primary" /> On this view
              </h3>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">{points.length}</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s === status ? "" : s)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                    status === s ? "border-primary bg-primary/10 text-primary" : "border-border bg-white text-muted-foreground hover:bg-muted"
                  )}
                >
                  <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_META[s].dot)} />
                  {STATUS_META[s].label}
                  <span className="text-[10px] opacity-70">{counts[s] ?? 0}</span>
                </button>
              ))}
            </div>

            <div className="border-t border-border pt-3">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Severity legend</p>
              <div className="space-y-1.5">
                {severityLegend().map((s) => (
                  <button
                    key={s.label}
                    onClick={() => setSeverity(s.label.toLowerCase() === severity ? "" : s.label.toLowerCase())}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2 py-1 text-sm transition-colors hover:bg-muted",
                      severity === s.label.toLowerCase() && "bg-muted"
                    )}
                  >
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.hex }} />
                    <span className="text-foreground">{s.label}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {points.filter((p) => (p.severity ?? "medium") === s.label.toLowerCase()).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-border pt-3">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Latest reports</p>
              <div className="space-y-2">
                {points.slice(0, 6).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelected(p)}
                    className={cn(
                      "w-full rounded-lg border p-2.5 text-left transition-colors hover:border-primary/40 hover:bg-primary/5",
                      selected?.id === p.id && "border-primary/50 bg-primary/5"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] font-semibold text-primary">{p.reportNumber}</span>
                      <span className="text-[10px] text-muted-foreground">{timeAgo(p.createdAt)}</span>
                    </div>
                    <p className="mt-1 line-clamp-1 text-sm font-medium text-foreground">{p.title}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {p.district ?? "Unknown"}
                    </p>
                  </button>
                ))}
                {points.length === 0 && !loading && (
                  <p className="py-4 text-center text-sm text-muted-foreground">No reports match the filters.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative min-h-0 overflow-hidden">
          {loading ? (
            <Skeleton className="h-full w-full rounded-none" />
          ) : (
            <>
              <ComplaintMap points={points} height="100%" onSelect={handleSelect} className="h-full rounded-none border-0" />
              {selected && !expanded && (
                <div className="absolute bottom-4 left-4 right-4 z-[1000] rounded-xl border border-border bg-white p-4 shadow-popover sm:left-auto sm:right-4 sm:w-80">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-mono text-[11px] font-semibold text-primary">{selected.reportNumber}</p>
                      <p className="mt-0.5 text-sm font-semibold text-foreground">{selected.title}</p>
                    </div>
                    <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", STATUS_META[selected.status].dot)} />
                  </div>
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {selected.district ?? "Unknown district"} · {selected.location.lat.toFixed(5)}, {selected.location.lng.toFixed(5)}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="rounded-full bg-muted px-2 py-0.5 font-medium text-muted-foreground">
                      {STATUS_META[selected.status].label}
                    </span>
                    {selected.severity && (
                      <span
                        className="rounded-full px-2 py-0.5 font-medium"
                        style={{ color: SEVERITY_META[selected.severity].hex, background: `${SEVERITY_META[selected.severity].hex}1a` }}
                      >
                        {SEVERITY_META[selected.severity].label} severity
                      </span>
                    )}
                  </div>
                  <Button size="sm" className="mt-3 w-full" onClick={() => navigate(`/complaints/${selected.reportNumber}`)}>
                    View full report
                  </Button>
                </div>
              )}
              <button
                onClick={() => setSelected(null)}
                className="absolute right-3 top-3 z-[1000] flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-muted-foreground shadow-sm transition-colors hover:bg-muted"
                aria-label="Reset selection"
              >
                <LocateFixed className="h-4 w-4" />
              </button>
              <div className="pointer-events-none absolute right-3 top-14 z-[1000] flex items-center gap-2 rounded-lg border border-border bg-white/95 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
                <Layers className="h-3.5 w-3.5 text-primary" /> Click markers for details
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
