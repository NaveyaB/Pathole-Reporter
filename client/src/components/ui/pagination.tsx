import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const getPages = (current: number, total: number): Array<number | "…"> => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: Array<number | "…"> = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push("…");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("…");
  pages.push(total);
  return pages;
};

export const Pagination = ({ page, totalPages, onPageChange, className }: PaginationProps) => {
  if (totalPages <= 1) return null;
  const pages = getPages(page, totalPages);

  return (
    <nav className={cn("flex items-center justify-center gap-1", className)} aria-label="Pagination">
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-white text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className="px-1 text-muted-foreground">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={cn(
              "h-8 w-8 rounded-md text-sm font-medium transition-colors",
              p === page
                ? "bg-primary text-white shadow-sm"
                : "border border-border bg-white text-muted-foreground hover:bg-muted"
            )}
            aria-current={p === page ? "page" : undefined}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-white text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
};
