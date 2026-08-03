import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useClickOutside } from "@/hooks/useClickOutside";
import { cn } from "@/lib/utils";

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  icon?: ReactNode;
  description?: string;
}

interface SelectProps<T extends string = string> {
  value?: T;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  label?: string;
}

export const Select = <T extends string = string>({
  value,
  onChange,
  options,
  placeholder = "Select…",
  className,
  disabled,
  label,
}: SelectProps<T>) => {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside(() => setOpen(false), open);
  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className={cn("relative", className)}>
      {label && <p className="mb-1.5 text-sm font-medium text-foreground">{label}</p>}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-input bg-white px-3 text-sm shadow-sm transition-colors focus-ring disabled:cursor-not-allowed disabled:opacity-50",
          open && "border-primary ring-2 ring-ring ring-offset-1"
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={cn("flex min-w-0 items-center gap-2", !selected && "text-muted-foreground/70")}>
          {selected?.icon}
          <span className="truncate">{selected?.label ?? placeholder}</span>
        </span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="absolute z-50 mt-1 max-h-64 w-full min-w-[160px] overflow-auto rounded-lg border border-border bg-white p-1 shadow-popover scrollbar-thin"
          >
            {options.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={option.value === value}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors hover:bg-muted",
                    option.value === value && "bg-primary/5 font-medium text-primary"
                  )}
                >
                  {option.icon}
                  <span className="min-w-0">
                    <span className="block truncate">{option.label}</span>
                    {option.description && (
                      <span className="block truncate text-xs text-muted-foreground">{option.description}</span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};
