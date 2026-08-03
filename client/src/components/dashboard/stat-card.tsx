import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { useCountUp } from "@/hooks/useCountUp";
import { formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  suffix?: string;
  prefix?: string;
  trend?: number;
  trendLabel?: string;
  iconBg?: string;
  delay?: number;
  decimals?: number;
}

export const StatCard = ({
  title,
  value,
  icon,
  suffix,
  prefix,
  trend,
  trendLabel,
  iconBg = "bg-primary/10 text-primary",
  delay = 0,
  decimals = 0,
}: StatCardProps) => {
  const display = useCountUp(value);
  const formatted =
    decimals > 0
      ? display.toFixed(decimals)
      : formatNumber(display);
  const finalValue = prefix ? `${prefix}${formatted}${suffix ?? ""}` : `${formatted}${suffix ?? ""}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="group relative overflow-hidden p-5 transition-shadow hover:shadow-card-hover">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-muted-foreground">{title}</p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{finalValue}</p>
            {trend != null && (
              <p className="mt-2 flex items-center gap-1.5 text-xs">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-1.5 py-0.5 font-semibold",
                    trend >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                  )}
                >
                  {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}
                  {trendLabel ? ` ${trendLabel}` : ""}
                </span>
              </p>
            )}
          </div>
          <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110", iconBg)}>
            {icon}
          </div>
        </div>
        <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-transparent to-current opacity-[0.04]" />
      </Card>
    </motion.div>
  );
};
