import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useClickOutside } from "@/hooks/useClickOutside";
import { cn } from "@/lib/utils";

export interface DropdownItem {
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
  separator?: boolean;
}

interface DropdownMenuProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: "start" | "end";
  width?: string;
  className?: string;
}

export const DropdownMenu = ({ trigger, items, align = "end", width = "w-56", className }: DropdownMenuProps) => {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside(() => setOpen(false), open);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <div onClick={() => setOpen((o) => !o)}>{trigger}</div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className={cn(
              "absolute z-50 mt-1.5 overflow-hidden rounded-lg border border-border bg-white py-1 shadow-popover",
              width,
              align === "end" ? "right-0" : "left-0"
            )}
          >
            {items.map((item, i) =>
              item.separator ? (
                <div key={`sep-${i}`} className="my-1 h-px bg-border" />
              ) : (
                <button
                  key={`item-${i}`}
                  type="button"
                  disabled={item.disabled}
                  onClick={() => {
                    item.onClick?.();
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50",
                    item.danger ? "text-rose-600" : "text-foreground"
                  )}
                >
                  {item.icon && <span className="shrink-0 text-muted-foreground">{item.icon}</span>}
                  {item.label}
                </button>
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
