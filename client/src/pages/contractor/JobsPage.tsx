import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ClipboardList, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { ComplaintTable } from "@/components/complaints/complaint-table";
import { Pagination } from "@/components/ui/pagination";
import { PageHeader } from "@/components/shared/page-header";
import { useAuth } from "@/contexts/AuthContext";
import { complaintApi } from "@/services";
import { titleCase } from "@/lib/utils";
import type { Complaint } from "@/types";

const PAGE_SIZE = 12;

const GROUPS = [
  { value: "all", label: "All jobs" },
  { value: "assigned", label: "Ready" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
];

export default function JobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Complaint[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState("all");

  const load = useCallback(() => {
    if (!user) return;
    setLoading(true);
    complaintApi
      .list({
        contractor: user.id,
        page,
        pageSize: PAGE_SIZE,
        ...(group !== "all" ? { status: group } : {}),
      })
      .then((res) => {
        setJobs(res.data);
        setTotal(res.meta.total);
        setTotalPages(Math.max(1, res.meta.totalPages));
      })
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, [user, page, group]);

  useEffect(() => {
    load();
  }, [load]);

  const counts = useMemo(() => {
    const all = total;
    const c: Record<string, number> = {};
    c.all = all;
    jobs.forEach((j) => {
      c[j.status] = (c[j.status] ?? 0) + 1;
    });
    return c;
  }, [jobs, total]);

  const tabs = GROUPS.map((g) => ({ ...g, badge: counts[g.value] ?? 0 }));

  return (
    <div>
      <PageHeader
        title="My jobs"
        description={`${total} assignments for your team — track and complete repairs.`}
        crumbs={[{ label: "Dashboard", to: "/contractor" }, { label: "Jobs" }]}
        actions={
          <Button variant="outline" size="sm" className="gap-2" onClick={() => { setGroup("all"); setPage(1); }}>
            <MapPin className="h-4 w-4" /> Reset filters
          </Button>
        }
      />

      <Tabs tabs={tabs} value={group} onValueChange={(v) => { setGroup(v); setPage(1); }} className="mb-5 w-fit" />

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardContent className="p-0">
            {jobs.length === 0 && !loading ? (
              <EmptyState
                icon={<ClipboardList className="h-6 w-6" />}
                title={group === "all" ? "No jobs assigned yet" : `No ${titleCase(group)} jobs`}
                description={
                  group === "all"
                    ? "Once the municipality assigns a verified complaint to your team, it will appear here."
                    : "Try a different filter to see more jobs."
                }
                className="m-4"
              />
            ) : (
              <ComplaintTable complaints={jobs} loading={loading} basePath="/contractor/jobs" />
            )}
          </CardContent>
        </Card>
      </motion.div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} className="mt-5" />
    </div>
  );
}
