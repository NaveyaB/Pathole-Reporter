import { cn } from "@/lib/utils";

export const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn("skeleton", className)} />
);

export const Spinner = ({ className }: { className?: string }) => (
  <svg className={cn("animate-spin", className ?? "h-5 w-5")} viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

export const LoadingBlock = ({ rows = 4, className }: { rows?: number; className?: string }) => (
  <div className={cn("space-y-3", className)}>
    {Array.from({ length: rows }).map((_, i) => (
      <Skeleton key={i} className="h-14 w-full" />
    ))}
  </div>
);
