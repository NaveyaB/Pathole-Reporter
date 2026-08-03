import { lazy, Suspense, type ReactNode } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { Spinner } from "@/components/ui/skeleton";
import AuthProvider, { useAuth } from "@/contexts/AuthContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { AppShell } from "@/components/layout/app-shell";
import { AuthLayout } from "@/components/layout/auth-layout";
import type { Role } from "@/types";

const LandingPage = lazy(() => import("@/pages/landing/LandingPage"));
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/auth/RegisterPage"));

const CitizenDashboard = lazy(() => import("@/pages/citizen/CitizenDashboardPage"));
const ReportComplaint = lazy(() => import("@/pages/citizen/ReportComplaintPage"));
const MyComplaints = lazy(() => import("@/pages/citizen/MyComplaintsPage"));

const ComplaintDetail = lazy(() => import("@/pages/ComplaintDetailPage"));
const MapExplorer = lazy(() => import("@/pages/MapExplorerPage"));
const NotificationsPage = lazy(() => import("@/pages/NotificationsPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));

const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboardPage"));
const ManageComplaints = lazy(() => import("@/pages/admin/ManageComplaintsPage"));
const ContractorsPage = lazy(() => import("@/pages/admin/ContractorsPage"));
const CitizensPage = lazy(() => import("@/pages/admin/CitizensPage"));
const AnalyticsPage = lazy(() => import("@/pages/admin/AnalyticsPage"));
const ReportsPage = lazy(() => import("@/pages/admin/ReportsPage"));

const ContractorDashboard = lazy(() => import("@/pages/contractor/ContractorDashboardPage"));
const JobsPage = lazy(() => import("@/pages/contractor/JobsPage"));

const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

const PageLoader = () => (
  <div className="flex min-h-[50vh] items-center justify-center">
    <div className="flex flex-col items-center gap-3 text-muted-foreground">
      <Spinner className="h-8 w-8 text-primary" />
      <p className="text-sm">Loading…</p>
    </div>
  </div>
);

const withSuspense = (node: ReactNode) => <Suspense fallback={<PageLoader />}>{node}</Suspense>;

const RequireAuth = () => {
  const { loading, isAuthenticated } = useAuth();
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading your workspace…</p>
        </div>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
};

const RoleGuard = ({ roles }: { roles: Role[] }) => {
  const { role } = useAuth();
  const home: Record<string, string> = { admin: "/admin", super_admin: "/admin", contractor: "/contractor", citizen: "/dashboard" };
  if (!role || !roles.includes(role)) {
    return <Navigate to={home[role ?? "citizen"] ?? "/"} replace />;
  }
  return <Outlet />;
};

const PublicOnly = () => {
  const { isAuthenticated, role } = useAuth();
  const home: Record<string, string> = { admin: "/admin", super_admin: "/admin", contractor: "/contractor", citizen: "/dashboard" };
  if (isAuthenticated) return <Navigate to={home[role ?? "citizen"]} replace />;
  return <Outlet />;
};

const App = () => (
  <BrowserRouter>
    <ToastProvider>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            <Route path="/" element={withSuspense(<LandingPage />)} />

            <Route element={<PublicOnly />}>
              <Route element={<AuthLayout />}>
                <Route path="/login" element={withSuspense(<LoginPage />)} />
                <Route path="/register" element={withSuspense(<RegisterPage />)} />
              </Route>
            </Route>

            <Route element={<RequireAuth />}>
              <Route element={<AppShell />}>
                {/* Citizen */}
                <Route element={<RoleGuard roles={["citizen"]} />}>
                  <Route path="/dashboard" element={withSuspense(<CitizenDashboard />)} />
                  <Route path="/report" element={withSuspense(<ReportComplaint />)} />
                  <Route path="/complaints" element={withSuspense(<MyComplaints />)} />
                </Route>

                {/* Shared */}
                <Route path="/complaints/:reportNumber" element={withSuspense(<ComplaintDetail />)} />
                <Route path="/map" element={withSuspense(<MapExplorer />)} />
                <Route path="/notifications" element={withSuspense(<NotificationsPage />)} />
                <Route path="/profile" element={withSuspense(<ProfilePage />)} />
                <Route path="/settings" element={withSuspense(<SettingsPage />)} />

                {/* Admin */}
                <Route element={<RoleGuard roles={["admin", "super_admin"]} />}>
                  <Route path="/admin" element={withSuspense(<AdminDashboard />)} />
                  <Route path="/admin/complaints" element={withSuspense(<ManageComplaints />)} />
                  <Route path="/admin/complaints/:reportNumber" element={withSuspense(<ComplaintDetail />)} />
                  <Route path="/admin/contractors" element={withSuspense(<ContractorsPage />)} />
                  <Route path="/admin/citizens" element={withSuspense(<CitizensPage />)} />
                  <Route path="/admin/analytics" element={withSuspense(<AnalyticsPage />)} />
                  <Route path="/admin/reports" element={withSuspense(<ReportsPage />)} />
                  <Route path="/admin/map" element={withSuspense(<MapExplorer />)} />
                </Route>

                {/* Contractor */}
                <Route element={<RoleGuard roles={["contractor"]} />}>
                  <Route path="/contractor" element={withSuspense(<ContractorDashboard />)} />
                  <Route path="/contractor/jobs" element={withSuspense(<JobsPage />)} />
                  <Route path="/contractor/jobs/:reportNumber" element={withSuspense(<ComplaintDetail />)} />
                  <Route path="/contractor/map" element={withSuspense(<MapExplorer />)} />
                </Route>
              </Route>
            </Route>

            <Route path="*" element={withSuspense(<NotFoundPage />)} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </ToastProvider>
  </BrowserRouter>
);

export default App;
