import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Table = ({ className, ...props }: HTMLAttributes<HTMLTableElement>) => (
  <div className="w-full overflow-x-auto scrollbar-thin">
    <table className={cn("w-full caption-bottom text-sm", className)} {...props} />
  </div>
);

export const TableHeader = ({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) => (
  <thead className={cn("bg-muted/60 [&_tr]:border-b", className)} {...props} />
);

export const TableBody = ({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) => (
  <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />
);

export const TableRow = ({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) => (
  <tr className={cn("border-b border-border transition-colors hover:bg-muted/50", className)} {...props} />
);

export const TableHead = ({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) => (
  <th className={cn("h-10 px-4 text-left align-middle text-xs font-semibold uppercase tracking-wide text-muted-foreground", className)} {...props} />
);

export const TableCell = ({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={cn("px-4 py-3 align-middle", className)} {...props} />
);
