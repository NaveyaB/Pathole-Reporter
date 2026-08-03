import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Breadcrumb, type Crumb } from "@/components/ui/breadcrumb";

interface PageHeaderProps {
  title: ReactNode;
  description?: string;
  crumbs?: Crumb[];
  actions?: ReactNode;
  className?: string;
}

export const PageHeader = ({ title, description, crumbs, actions, className }: PageHeaderProps) => (
  <motion.div
    initial={{ opacity: 0, y: -6 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35 }}
    className={cn("mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", className)}
  >
    <div className="min-w-0">
      {crumbs && crumbs.length > 0 && (
        <div className="mb-1.5">
          <Breadcrumb items={crumbs} />
        </div>
      )}
      <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
    </div>
    {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
  </motion.div>
);
