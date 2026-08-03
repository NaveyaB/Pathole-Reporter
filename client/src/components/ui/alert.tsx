import type { ReactNode } from "react";
import { AlertCircle, Info, AlertTriangle, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";

type AlertVariant = "info" | "warning" | "danger" | "success";

const STYLES: Record<AlertVariant, { wrapper: string; icon: ReactNode }> = {
  info: {
    wrapper: "border-blue-200 bg-blue-50 text-blue-800",
    icon: <Info className="h-4 w-4" />,
  },
  warning: {
    wrapper: "border-amber-200 bg-amber-50 text-amber-800",
    icon: <AlertTriangle className="h-4 w-4" />,
  },
  danger: {
    wrapper: "border-rose-200 bg-rose-50 text-rose-800",
    icon: <AlertCircle className="h-4 w-4" />,
  },
  success: {
    wrapper: "border-emerald-200 bg-emerald-50 text-emerald-800",
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
};

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children?: ReactNode;
  onClose?: () => void;
  className?: string;
}

export const Alert = ({ variant = "info", title, children, onClose, className }: AlertProps) => {
  const style = STYLES[variant];
  return (
    <div className={cn("relative flex items-start gap-3 rounded-lg border p-3.5 text-sm", style.wrapper, className)} role="alert">
      <div className="mt-0.5 shrink-0">{style.icon}</div>
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={cn(title && "mt-0.5", "opacity-90")}>{children}</div>}
      </div>
      {onClose && (
        <button onClick={onClose} className="shrink-0 rounded p-0.5 opacity-70 transition-opacity hover:opacity-100" aria-label="Dismiss">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
