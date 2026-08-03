import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export interface Crumb {
  label: string;
  to?: string;
  href?: string;
}

export const Breadcrumb = ({ items }: { items: Crumb[] }) => (
  <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
    {items.map((item, i) => {
      const isLast = i === items.length - 1;
      const linkTo = item.to ?? item.href;
      return (
        <span key={`${item.label}-${i}`} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />}
          {linkTo && !isLast ? (
            <Link
              to={linkTo}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ) : (
            <span className={cn(isLast ? "font-medium text-foreground" : "text-muted-foreground")}>{item.label}</span>
          )}
        </span>
      );
    })}
  </nav>
);
