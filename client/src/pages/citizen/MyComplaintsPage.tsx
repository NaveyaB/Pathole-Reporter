import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { ComplaintCard } from "@/components/complaints/complaint-card";
import { ComplaintTable } from "@/components/complaints/complaint-table";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { useAuth } from "@/contexts/AuthContext";
import { complaintApi } from "@/services";
import { titleCase } from "@/lib/utils";
import type { Complaint } from "@/types";

type View = "grid" | "table";

const STATUS_GROUPS = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "rejected", label: "Rejected" },
];

export default function MyComplaintsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState("all");
  const [view, setView] = useState<View>("grid");

  const load = useCallback(() => {
    setLoading(true);
    complaintApi
      .mine()
      .then(setComplaints)
      .catch(() => setComplaints([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    switch (group) {
      case "open":
        return complaints.filter((c) => ["submitted", "under_review", "verified", "assigned"].includes(c.status));
      case "in_progress":
        return complaints.filter((c) => c.status === "in_progress");
      case "completed":
        return complaints.filter((c) => c.status === "completed");
      case "rejected":
        return complaints.filter((c) => c.status === "rejected");
      default:
        return complaints;
    }
  }, [complaints, group]);

  const counts = useMemo(
    () => ({
      all: complaints.length,
      open: complaints.filter((c) => ["submitted", "under_review", "verified", "assigned"].includes(c.status)).length,
      in_progress: complaints.filter((c) => c.status === "in_progress").length,
      completed: complaints.filter((c) => c.status === "completed").length,
      rejected: complaints.filter((c) => c.status === "rejected").length,
    }),
    [complaints]
  );

  const tabs = STATUS_GROUPS.map((g) => ({ ...g, badge: counts[g.value as keyof typeof counts] }));

  return (
    <div>
      <PageHeader
        title="My complaints"
        description={`Reports you've submitted as ${user?.name?.split(" ")[0] ?? "citizen"}.`}
        crumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "My complaints" }]}
        actions={
          <>
            <div className="flex items-center gap-1 rounded-lg border border-border bg-white p-1 shadow-sm">
              {(["grid", "table"] as View[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                    view === v ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
            <Button onClick={() => navigate("/report")} className="gap-2">
              <PlusCircle className="h-4 w-4" /> New report
            </Button>
          </>
        }
      />

      <Tabs tabs={tabs} value={group} onValueChange={setGroup} className="mb-5 w-fit" />

      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-10">
            <EmptyState
              icon={<MapPin className="h-6 w-6" />}
              title={complaints.length === 0 ? "No complaints yet" : `No ${titleCase(group)} complaints`}
              description={
                complaints.length === 0
                  ? "Spot a pothole or road damage? Report it and our AI will assess the severity instantly."
                  : "Try a different filter to see more reports."
              }
              action={
                complaints.length === 0 ? (
                  <Button onClick={() => navigate("/report")} className="gap-2">
                    <PlusCircle className="h-4 w-4" /> Report damage
                  </Button>
                ) : undefined
              }
            />
          </CardContent>
        </Card>
      ) : view === "grid" ? (
        <motion.div
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
        >
          {filtered.map((c, i) => (
            <ComplaintCard key={c.id} complaint={c} basePath="/complaints" index={i} />
          ))}
        </motion.div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <ComplaintTable complaints={filtered} basePath="/complaints" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
