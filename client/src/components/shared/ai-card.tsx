import { motion } from "framer-motion";
import { Brain, Cpu, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SeverityBadge, TypeBadge } from "@/components/shared/badges";
import type { AIAnalysis } from "@/types";
import { cn, formatDateTime, titleCase } from "@/lib/utils";
import { SEVERITY_META } from "@/constants";

export const ConfidenceRing = ({ value, className }: { value: number; className?: string }) => {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const color = value >= 90 ? "#22c55e" : value >= 75 ? "#10b981" : value >= 55 ? "#f59e0b" : "#ef4444";

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width="92" height="92" viewBox="0 0 92 92" className="-rotate-90">
        <circle cx="46" cy="46" r={radius} fill="none" stroke="hsl(210 40% 94%)" strokeWidth="7" />
        <motion.circle
          cx="46"
          cy="46"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-foreground">{Math.round(value)}%</span>
        <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Confidence</span>
      </div>
    </div>
  );
};

interface AICardProps {
  analysis: AIAnalysis;
  className?: string;
  compact?: boolean;
}

export const AICard = ({ analysis, className, compact }: AICardProps) => {
  if (!analysis) return null;
  const severityHex = SEVERITY_META[analysis.severity]?.hex ?? "#94a3b8";

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-primary/5 via-transparent to-transparent px-5 py-3.5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Brain className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold">AI Analysis</p>
            <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Cpu className="h-3 w-3" /> {analysis.model ?? "yolov8-road-damage-v2"}
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600">
          <ShieldCheck className="h-3 w-3" /> Processed
        </span>
      </div>

      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <ConfidenceRing value={analysis.confidence} />
        <div className="flex-1 space-y-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Detected</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <TypeBadge type={analysis.detected} className="capitalize" />
              <SeverityBadge severity={analysis.severity} />
            </div>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Recommendation</p>
            <p className="mt-1 flex items-start gap-1.5 text-sm font-medium" style={{ color: severityHex }}>
              <TrendingUp className="mt-0.5 h-4 w-4 shrink-0" />
              {analysis.recommendation}
            </p>
          </div>

          {!compact && (
            <>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Detected signals</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {analysis.tags?.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      <Sparkles className="h-3 w-3 text-accent" />
                      {titleCase(tag)}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">Analyzed {formatDateTime(analysis.analyzedAt)}</p>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};
