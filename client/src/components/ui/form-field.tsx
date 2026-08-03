import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FieldProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export const Field = ({ label, error, hint, required, children, className }: FieldProps) => (
  <div className={cn("space-y-1.5", className)}>
    {label && (
      <label className="flex items-center gap-0.5 text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-danger">*</span>}
      </label>
    )}
    {children}
    {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
    {error && <p className="flex items-center gap-1 text-xs font-medium text-danger">{error}</p>}
  </div>
);

export const FormError = ({ message }: { message?: string | null }) =>
  message ? (
    <div className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700" role="alert">
      {message}
    </div>
  ) : null;
