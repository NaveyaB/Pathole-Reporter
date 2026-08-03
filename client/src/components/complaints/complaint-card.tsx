import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, ImageIcon, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatusBadge, PriorityBadge, SeverityBadge } from "@/components/shared/badges";
import { timeAgo } from "@/lib/utils";
import type { Complaint } from "@/types";

export const ComplaintCard = ({
  complaint,
  basePath = "/complaints",
  index = 0,
}: {
  complaint: Complaint;
  basePath?: string;
  index?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.5) }}
  >
    <Card className="group overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-card-hover">
      <Link to={`${basePath}/${complaint.reportNumber}`} className="block">
        <div className="relative h-36 w-full bg-muted">
          {complaint.images[0] ? (
            <img
              src={complaint.images[0].url}
              alt={complaint.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-border/60">
              <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
            </div>
          )}
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            <PriorityBadge priority={complaint.priority} />
          </div>
          <div className="absolute right-3 top-3 rounded-md bg-white/90 px-2 py-1 font-mono text-[10px] font-semibold text-foreground shadow-sm backdrop-blur">
            {complaint.reportNumber}
          </div>
          {complaint.aiAnalysis && (
            <div className="absolute bottom-3 left-3 rounded-md bg-black/60 px-2 py-1 text-[10px] font-medium text-white backdrop-blur">
              AI: {complaint.aiAnalysis.confidence}% confidence
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 text-sm font-semibold text-foreground">{complaint.title}</h3>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {complaint.district ?? "Unknown"}
            </span>
            <span>· {timeAgo(complaint.timestamps.created)}</span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <StatusBadge status={complaint.status} />
            {complaint.aiAnalysis && <SeverityBadge severity={complaint.aiAnalysis.severity} />}
          </div>
        </div>
      </Link>
    </Card>
  </motion.div>
);
