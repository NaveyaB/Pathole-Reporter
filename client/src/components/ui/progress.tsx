import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number;
  className?: string;
  indicatorClassName?: string;
  max?: number;
}

export const Progress = ({ value, className, indicatorClassName, max = 100 }: ProgressProps) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div
        className={cn("h-full rounded-full bg-primary transition-all duration-700 ease-out", indicatorClassName)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
};
