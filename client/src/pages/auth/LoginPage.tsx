import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, KeyRound, LogIn, ShieldCheck, User as UserIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FormError } from "@/components/ui/form-field";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { authApi } from "@/services";
import { getErrorMessage } from "@/lib/api";

interface LoginForm {
  email: string;
  password: string;
}

interface DemoAccount {
  role: string;
  email: string;
  password: string;
  hint: string;
}

const ROLE_STYLES: Record<string, string> = {
  citizen: "border-sky-200 bg-sky-50 text-sky-700",
  contractor: "border-indigo-200 bg-indigo-50 text-indigo-700",
  admin: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

const ROLE_ICONS: Record<string, React.ReactNode> = {
  citizen: <UserIcon className="h-4 w-4" />,
  contractor: <KeyRound className="h-4 w-4" />,
  admin: <ShieldCheck className="h-4 w-4" />,
};

const ROLE_LABELS: Record<string, string> = {
  citizen: "Citizen",
  contractor: "Contractor",
  admin: "Municipal Admin",
};

export default function LoginPage() {
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [demoAccounts, setDemoAccounts] = useState<DemoAccount[]>([]);
  const { register, handleSubmit, setValue } = useForm<LoginForm>({ defaultValues: { email: "", password: "" } });

  useEffect(() => {
    authApi.demoAccounts().then((d) => setDemoAccounts(d.accounts)).catch(() => undefined);
  }, []);

  const goHome = (role?: string) => {
    navigate(role === "admin" || role === "super_admin" ? "/admin" : role === "contractor" ? "/contractor" : "/dashboard");
  };

  const onSubmit = async (values: LoginForm) => {
    setSubmitError(null);
    setLoading(true);
    try {
      const user = await login(values.email, values.password);
      success("Welcome back!", `Signed in as ${user.name}`);
      goHome(user.role);
    } catch (err) {
      setSubmitError(getErrorMessage(err));
      error("Login failed", getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (acc: DemoAccount) => {
    setValue("email", acc.email);
    setValue("password", acc.password);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign in to track road repairs and manage complaints.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {submitError && <FormError message={submitError} />}
        <Field label="Email address">
          <Input type="email" placeholder="you@example.com" autoComplete="email" {...register("email", { required: true })} />
        </Field>
        <Field label="Password">
          <Input type="password" placeholder="••••••••" autoComplete="current-password" {...register("password", { required: true })} />
        </Field>

        <div className="flex items-center justify-between text-sm">
          <Link to="/register" className="font-medium text-primary hover:underline">
            Create an account
          </Link>
          <span className="text-muted-foreground">Forgot password?</span>
        </div>

        <Button type="submit" size="lg" className="w-full" loading={loading}>
          {!loading && <LogIn className="h-4 w-4" />} Sign in
        </Button>
      </form>

      {demoAccounts.length > 0 && (
        <div className="mt-8">
          <div className="mb-3 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Demo accounts — one-click fill</p>
            <span className="h-px flex-1 bg-border" />
          </div>
          <div className="space-y-2">
            {demoAccounts.map((acc) => (
              <button
                key={acc.role}
                type="button"
                onClick={() => fillDemo(acc)}
                className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all hover:shadow-sm ${ROLE_STYLES[acc.role] ?? "border-slate-200 bg-slate-50 text-slate-700"}`}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/70">
                  {ROLE_ICONS[acc.role]}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{ROLE_LABELS[acc.role] ?? acc.role}</span>
                  <span className="block truncate font-mono text-xs opacity-80">
                    {acc.email} · {acc.password}
                  </span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 opacity-60" />
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
