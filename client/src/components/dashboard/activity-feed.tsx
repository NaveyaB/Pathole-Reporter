import { motion } from "framer-motion";
import { Activity, MapPin, MessageSquare, PenTool, ShieldCheck, Sparkles, ThumbsUp, Truck } from "lucide-react";
import type { ReactNode } from "react";
import { cn, timeAgo } from "@/lib/utils";

const ACTION_ICONS: Record<string, { icon: ReactNode; className: string }> = {
  "complaint.submitted": { icon: <MapPin className="h-3.5 w-3.5" />, className: "bg-blue-50 text-blue-600" },
  "complaint.verified": { icon: <ShieldCheck className="h-3.5 w-3.5" />, className: "bg-emerald-50 text-emerald-600" },
  "complaint.assigned": { icon: <Truck className="h-3.5 w-3.5" />, className: "bg-indigo-50 text-indigo-600" },
  "complaint.in_progress": { icon: <PenTool className="h-3.5 w-3.5" />, className: "bg-amber-50 text-amber-600" },
  "complaint.completed": { icon: <ThumbsUp className="h-3.5 w-3.5" />, className: "bg-emerald-50 text-emerald-600" },
  "feedback.submitted": { icon: <MessageSquare className="h-3.5 w-3.5" />, className: "bg-fuchsia-50 text-fuchsia-600" },
  "ai.analyzed": { icon: <Sparkles className="h-3.5 w-3.5" />, className: "bg-violet-50 text-violet-600" },
  "user.registered": { icon: <Activity className="h-3.5 w-3.5" />, className: "bg-sky-50 text-sky-600" },
};

interface ActivityItem {
  id: string;
  action: string;
  description: string;
  createdAt: string;
}

interface ActivityFeedProps {
  items: ActivityItem[];
  className?: string;
}

export const ActivityFeed = ({ items, className }: ActivityFeedProps) => (
  <div className={cn("relative", className)}>
    {items.map((item, i) => {
      const meta = ACTION_ICONS[item.action] ?? { icon: <Activity className="h-3.5 w-3.5" />, className: "bg-slate-100 text-slate-600" };
      return (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
          className="relative flex gap-3 pb-4 last:pb-0"
        >
          {i < items.length - 1 && <span className="absolute left-[13px] top-8 h-full w-px bg-border" />}
          <div className={cn("relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full", meta.className)}>
            {meta.icon}
          </div>
          <div className="min-w-0 pt-0.5">
            <p className="text-sm text-foreground">{item.description}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{timeAgo(item.createdAt)}</p>
          </div>
        </motion.div>
      );
    })}
  </div>
);
