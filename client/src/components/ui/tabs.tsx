import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface TabItem {
  value: string;
  label: string;
  icon?: ReactNode;
  badge?: number;
}

interface TabsProps {
  tabs: TabItem[];
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

export const Tabs = ({ tabs, value, onValueChange, className }: TabsProps) => {
  const [internal, setInternal] = useState(tabs[0]?.value);
  const active = value ?? internal;

  return (
    <div className={cn("flex items-center gap-1 rounded-lg bg-muted p-1", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => {
            setInternal(tab.value);
            onValueChange?.(tab.value);
          }}
          className={cn(
            "relative flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            active === tab.value ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {active === tab.value && (
            <motion.span
              layoutId="tab-pill"
              className="absolute inset-0 rounded-md bg-white shadow-sm ring-1 ring-border"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-1.5">
            {tab.icon}
            {tab.label}
            {tab.badge != null && tab.badge > 0 && (
              <span className="rounded-full bg-primary/10 px-1.5 text-[10px] font-semibold text-primary">{tab.badge}</span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
};
