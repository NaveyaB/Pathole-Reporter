import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info" | "warning";

interface Toast {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (title: string, description?: string, variant?: ToastVariant) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS: Record<ToastVariant, ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
  error: <AlertCircle className="h-5 w-5 text-rose-500" />,
  warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
  info: <Info className="h-5 w-5 text-blue-500" />,
};

const BORDERS: Record<ToastVariant, string> = {
  success: "border-l-emerald-500",
  error: "border-l-rose-500",
  warning: "border-l-amber-500",
  info: "border-l-blue-500",
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (title: string, description?: string, variant: ToastVariant = "info") => {
      const id = ++counter.current;
      setToasts((prev) => [...prev, { id, title, description, variant }]);
      window.setTimeout(() => dismiss(id), 5000);
    },
    [dismiss]
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      toast,
      success: (t, d) => toast(t, d, "success"),
      error: (t, d) => toast(t, d, "error"),
      info: (t, d) => toast(t, d, "info"),
      warning: (t, d) => toast(t, d, "warning"),
    }),
    [toast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-[9999] flex w-full max-w-sm flex-col gap-2.5">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24, transition: { duration: 0.18 } }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              className={cn(
                "pointer-events-auto flex items-start gap-3 rounded-xl border border-border bg-white p-4 shadow-popover border-l-4",
                BORDERS[t.variant]
              )}
            >
              <div className="mt-0.5 shrink-0">{ICONS[t.variant]}</div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">{t.title}</p>
                {t.description && (
                  <p className="mt-0.5 text-sm text-muted-foreground">{t.description}</p>
                )}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="shrink-0 rounded-md p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};
