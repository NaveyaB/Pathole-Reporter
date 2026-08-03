import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FormError } from "@/components/ui/form-field";
import { Select } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { getErrorMessage } from "@/lib/api";
import { DISTRICT_NAMES } from "@/constants";

interface RegisterForm {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  district: string;
  role: "citizen" | "contractor";
}

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<RegisterForm>({
    defaultValues: { role: "citizen", district: DISTRICT_NAMES[0] },
  });
  const password = watch("password");

  const onSubmit = async (values: RegisterForm) => {
    setSubmitError(null);
    if (values.password !== values.confirmPassword) {
      setSubmitError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const user = await registerUser({
        name: values.name,
        email: values.email,
        phone: values.phone,
        password: values.password,
        district: values.district,
        role: values.role,
      });
      success("Account created", `Welcome, ${user.name}!`);
      navigate(user.role === "contractor" ? "/contractor" : "/dashboard");
    } catch (err) {
      const msg = getErrorMessage(err);
      setSubmitError(msg);
      error("Registration failed", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Join the community keeping city roads safe.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {submitError && <FormError message={submitError} />}

        <Field label="Full name" required error={errors.name?.message}>
          <Input placeholder="e.g. Priya Sharma" autoComplete="name" {...register("name", { required: "Name is required", minLength: { value: 3, message: "Name is too short" } })} />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Email address" required error={errors.email?.message}>
            <Input type="email" placeholder="you@example.com" autoComplete="email" {...register("email", { required: "Email is required", pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email" } })} />
          </Field>
          <Field label="Phone" hint="Optional">
            <Input placeholder="+91 90000 00000" autoComplete="tel" {...register("phone")} />
          </Field>
        </div>

        <Field label="Account type" hint="Contractors are onboarded after verification">
          <div className="grid grid-cols-2 gap-3">
            {(["citizen", "contractor"] as const).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setValue("role", role)}
                className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all ${
                  watch("role") === role
                    ? "border-primary bg-primary/5 text-primary ring-2 ring-primary/20"
                    : "border-border bg-white text-muted-foreground hover:border-primary/40"
                }`}
              >
                <span className="block capitalize">{role}</span>
                <span className="text-xs font-normal opacity-80">
                  {role === "citizen" ? "Report and track issues" : "Bid on repair jobs"}
                </span>
              </button>
            ))}
          </div>
        </Field>

        <Field label="District" error={errors.district?.message}>
          <Select
            value={watch("district")}
            onChange={(v) => setValue("district", v)}
            options={DISTRICT_NAMES.map((d) => ({ value: d, label: d }))}
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Password" required error={errors.password?.message}>
            <Input type="password" placeholder="At least 6 characters" autoComplete="new-password" {...register("password", { required: "Password is required", minLength: { value: 6, message: "Minimum 6 characters" } })} />
          </Field>
          <Field label="Confirm password" required error={errors.confirmPassword?.message}>
            <Input type="password" placeholder="Repeat password" {...register("confirmPassword", { required: "Please confirm your password" })} />
          </Field>
        </div>

        {password && password.length < 6 && (
          <FormError message="Password must be at least 6 characters" />
        )}

        <Button type="submit" size="lg" className="w-full" loading={loading}>
          {!loading && <UserPlus className="h-4 w-4" />} Create account
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
        </p>
      </form>
    </motion.div>
  );
}
