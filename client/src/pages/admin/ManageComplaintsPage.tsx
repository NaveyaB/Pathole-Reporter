import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ClipboardList } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ComplaintFilters, type ComplaintFiltersState } from "@/components/complaints/complaint-filters";
import { ComplaintTable } from "@/components/complaints/complaint-table";
import { Pagination } from "@/components/ui/pagination";
import { PageHeader } from "@/components/shared/page-header";
import { complaintApi } from "@/services";
import type { Complaint } from "@/types";

const PAGE_SIZE = 15;

export default function ManageComplaintsPage() {
  const [searchParams] = useSearchParams();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ComplaintFiltersState>({
    search: "",
    status: "",
    district: "",
    priority: searchParams.get("priority") ?? "",
    severity: "",
  });

  useEffect(() => {
    const priority = searchParams.get("priority");
    if (priority) {
      setFilters((f) => ({ ...f, priority }));
      setPage(1);
    }
  }, [searchParams]);

  const load = useCallback(() => {
    setLoading(true);
    complaintApi
      .list({
        page,
        pageSize: PAGE_SIZE,
        search: filters.search || undefined,
        status: filters.status || undefined,
        district: filters.district || undefined,
        priority: filters.priority || undefined,
        severity: filters.severity || undefined,
      })
      .then((res) => {
        setComplaints(res.data);
        setTotal(res.meta.total);
        setTotalPages(Math.max(1, res.meta.totalPages));
      })
      .catch(() => setComplaints([]))
      .finally(() => setLoading(false));
  }, [page, filters]);

  useEffect(() => {
    load();
  }, [load]);

  const onFilterChange = (next: ComplaintFiltersState) => {
    setFilters(next);
    setPage(1);
  };

  const activeFilterCount = useMemo(
    () => Object.values(filters).filter((v) => v && v.trim() !== "").length,
    [filters]
  );

  return (
    <div>
      <PageHeader
        title="Manage complaints"
        description={`${total} reports across the city — verify, assign and track repairs.`}
        crumbs={[{ label: "Dashboard", to: "/admin" }, { label: "Complaints" }]}
        actions={
          <Button variant="outline" size="sm" className="gap-2" disabled={activeFilterCount === 0} onClick={() => onFilterChange({ search: "", status: "", district: "", priority: "", severity: "" })}>
            <ClipboardList className="h-4 w-4" /> Clear filters ({activeFilterCount})
          </Button>
        }
      />

      <ComplaintFilters filters={filters} onChange={onFilterChange} />

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
        <Card>
          <CardContent className="p-0">
            {complaints.length === 0 && !loading ? (
              <EmptyState
                icon={<ClipboardList className="h-6 w-6" />}
                title="No complaints found"
                description="Try adjusting your filters to see more reports."
                className="m-4"
              />
            ) : (
              <ComplaintTable complaints={complaints} loading={loading} basePath="/admin/complaints" />
            )}
          </CardContent>
        </Card>
      </motion.div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} className="mt-5" />
    </div>
  );
}
