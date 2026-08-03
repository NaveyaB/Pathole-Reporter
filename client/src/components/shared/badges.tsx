import { Badge } from "@/components/ui/badge";
import { STATUS_META, PRIORITY_META, SEVERITY_META, TYPE_META } from "@/constants";
import type { ComplaintStatus, Priority, RoadDamageType, Severity } from "@/types";
import { cn } from "@/lib/utils";

export const StatusBadge = ({ status, className }: { status: ComplaintStatus; className?: string }) => {
  const meta = STATUS_META[status];
  return (
    <Badge variant="outline" className={cn(meta.bg, className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </Badge>
  );
};

export const PriorityBadge = ({ priority, className }: { priority: Priority; className?: string }) => {
  const meta = PRIORITY_META[priority];
  return (
    <Badge variant="outline" className={cn(meta.className, className)}>
      {meta.label}
    </Badge>
  );
};

export const SeverityBadge = ({ severity, className }: { severity: Severity; className?: string }) => {
  const meta = SEVERITY_META[severity];
  return (
    <Badge variant="outline" className={cn(meta.className, className)}>
      {meta.label}
    </Badge>
  );
};

export const TypeBadge = ({ type, className }: { type: RoadDamageType; className?: string }) => (
  <Badge variant="muted" className={cn(className)}>
    {TYPE_META[type]?.label ?? type}
  </Badge>
);
