import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, ShieldBan, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { useToast } from "@/contexts/ToastContext";
import { userApi } from "@/services";
import { formatDate } from "@/lib/utils";
import type { User } from "@/types";

const PAGE_SIZE = 20;

export default function CitizensPage() {
  const { success, error } = useToast();
  const [citizens, setCitizens] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    userApi
      .list({ role: "citizen", search: search || undefined, page, pageSize: PAGE_SIZE })
      .then((res) => {
        setCitizens(res.data);
        setTotal(res.meta.total);
        setTotalPages(Math.max(1, res.meta.totalPages));
      })
      .catch(() => setCitizens([]))
      .finally(() => setLoading(false));
  }, [search, page]);

  useEffect(() => {
    const t = window.setTimeout(load, 300);
    return () => window.clearTimeout(t);
  }, [load]);

  const toggleStatus = async (u: User) => {
    setBusy(u.id);
    try {
      await userApi.update(u.id, { status: u.status === "active" ? "suspended" : "active" });
      success(u.status === "active" ? "Citizen suspended" : "Citizen activated", u.name);
      await load();
    } catch {
      error("Action failed", "Could not update citizen status.");
    } finally {
      setBusy(null);
    }
  };

  const remove = async (u: User) => {
    setBusy(u.id);
    try {
      await userApi.remove(u.id);
      success("Citizen removed", u.name);
      await load();
    } catch {
      error("Removal failed", "Could not delete this citizen.");
    } finally {
      setBusy(null);
    }
  };

  const activeCount = useMemo(() => citizens.filter((c) => c.status === "active").length, [citizens]);

  return (
    <div>
      <PageHeader
        title="Citizens"
        description={`${total} registered citizens — manage accounts and access.`}
        crumbs={[{ label: "Dashboard", to: "/admin" }, { label: "Citizens" }]}
        actions={
          <Badge variant="success" className="gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" /> {activeCount} active on page
          </Badge>
        }
      />

      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by name, email or district…"
          className="pl-9"
        />
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardContent className="p-0">
            {citizens.length === 0 && !loading ? (
              <EmptyState
                icon={<Users className="h-6 w-6" />}
                title="No citizens found"
                description="Try a different search."
                className="m-4"
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Citizen</TableHead>
                    <TableHead className="hidden md:table-cell">District</TableHead>
                    <TableHead className="hidden sm:table-cell">Joined</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading
                    ? Array.from({ length: 8 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell colSpan={5}><Skeleton className="h-10 w-full" /></TableCell>
                        </TableRow>
                      ))
                    : citizens.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar name={c.name} size="sm" />
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-foreground">{c.name}</p>
                                <p className="truncate text-xs text-muted-foreground">{c.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground">{c.district ?? "—"}</TableCell>
                          <TableCell className="hidden sm:table-cell text-muted-foreground">{formatDate(c.createdAt)}</TableCell>
                          <TableCell>
                            <Badge variant={c.status === "active" ? "success" : "danger"} className="capitalize">
                              {c.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu
                              align="end"
                              trigger={<Button variant="outline" size="sm">Manage</Button>}
                              items={[
                                {
                                  label: c.status === "active" ? "Suspend" : "Activate",
                                  icon: c.status === "active" ? <ShieldBan className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />,
                                  disabled: busy === c.id,
                                  onClick: () => void toggleStatus(c),
                                },
                                {
                                  label: "Remove",
                                  icon: <Users className="h-4 w-4" />,
                                  danger: true,
                                  disabled: busy === c.id,
                                  onClick: () => void remove(c),
                                },
                              ]}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} className="mt-5" />
    </div>
  );
}
