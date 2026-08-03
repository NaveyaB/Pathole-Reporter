import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  hideClose?: boolean;
}

const SIZES: Record<NonNullable<DialogProps["size"]>, string> = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export const Dialog = ({ open, onOpenChange, title, description, children, footer, size = "md", hideClose }: DialogProps) => {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onOpenChange]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className={cn(
              "relative z-10 w-full rounded-2xl border border-border bg-white shadow-2xl",
              SIZES[size]
            )}
          >
            <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
              <div>
                {title && <h2 className="text-lg font-semibold">{title}</h2>}
                {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
              </div>
              {!hideClose && (
                <button
                  onClick={() => onOpenChange(false)}
                  className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Close dialog"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            <div className="max-h-[70vh] overflow-y-auto px-6 py-5 scrollbar-thin">{children}</div>
            {footer && <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
