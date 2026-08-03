import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export const EmptyState = ({ icon, title, description, action, className }: EmptyStateProps) => (
  <div className={cn("flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center", className)}>
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">{icon}</div>
    <div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
    </div>
    {action}
  </div>
);
