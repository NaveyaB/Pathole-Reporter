import { Link } from "react-router-dom";
import { ArrowUpRight, MapPin } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { StatusBadge, PriorityBadge, SeverityBadge, TypeBadge } from "@/components/shared/badges";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import type { Complaint } from "@/types";

interface ComplaintTableProps {
  complaints: Complaint[];
  loading?: boolean;
  basePath?: string;
}

export const ComplaintTable = ({ complaints, loading, basePath = "/complaints" }: ComplaintTableProps) => {
  if (loading) {
    return (
      <div className="space-y-2 p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Report</TableHead>
          <TableHead>Title</TableHead>
          <TableHead className="hidden lg:table-cell">Type</TableHead>
          <TableHead className="hidden md:table-cell">District</TableHead>
          <TableHead className="hidden sm:table-cell">Priority</TableHead>
          <TableHead className="hidden sm:table-cell">Severity</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="hidden lg:table-cell">Reported</TableHead>
          <TableHead className="text-right">View</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {complaints.map((c) => (
          <TableRow key={c.id}>
            <TableCell>
              <Link to={`${basePath}/${c.reportNumber}`} className="font-mono text-xs font-semibold text-primary hover:underline">
                {c.reportNumber}
              </Link>
            </TableCell>
            <TableCell>
              <Link to={`${basePath}/${c.reportNumber}`} className="line-clamp-1 font-medium text-foreground hover:text-primary">
                {c.title}
              </Link>
            </TableCell>
            <TableCell className="hidden lg:table-cell">
              <TypeBadge type={c.type} />
            </TableCell>
            <TableCell className="hidden md:table-cell">
              <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {c.district ?? "—"}
              </span>
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              <PriorityBadge priority={c.priority} />
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              {c.aiAnalysis ? <SeverityBadge severity={c.aiAnalysis.severity} /> : <span className="text-xs text-muted-foreground">—</span>}
            </TableCell>
            <TableCell>
              <StatusBadge status={c.status} />
            </TableCell>
            <TableCell className="hidden text-muted-foreground lg:table-cell">{formatDate(c.timestamps.created)}</TableCell>
            <TableCell className="text-right">
              <Link
                to={`${basePath}/${c.reportNumber}`}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                aria-label={`View ${c.reportNumber}`}
              >
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
