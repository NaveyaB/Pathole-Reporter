import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Home, Search, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export default function NotFoundPage() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const home = role ? (role === "admin" || role === "super_admin" ? "/admin" : role === "contractor" ? "/contractor" : "/dashboard") : "/";

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-6">
      <div className="w-full max-w-lg text-center">
        <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 animate-pulse rounded-3xl bg-primary/10" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-border bg-white shadow-card-hover">
            <TriangleAlert className="h-9 w-9 text-primary" />
          </div>
        </div>
        <p className="font-mono text-sm font-semibold text-primary">ERROR 404</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-foreground">Page not found</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
          The page you're looking for doesn't exist or may have been moved. Let's get you back on the right road.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" onClick={() => navigate(-1)} variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Go back
          </Button>
          <Link to={home}>
            <Button size="lg" className="gap-2">
              <Home className="h-4 w-4" /> Back to home
            </Button>
          </Link>
        </div>
        <div className="mt-10 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Search className="h-3.5 w-3.5" />
          Looking for something specific? Try the navigation menu.
        </div>
      </div>
    </div>
  );
}
