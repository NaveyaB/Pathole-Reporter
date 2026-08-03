import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Pencil, PlusCircle, Star, Truck, UserX, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { Field, FormError } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { useToast } from "@/contexts/ToastContext";
import { userApi } from "@/services";
import { DISTRICT_NAMES } from "@/constants";
import { formatDate, formatDuration, initials } from "@/lib/utils";
import type { ContractorStats } from "@/types";

const defaultForm = {
  name: "",
  email: "",
  password: "",
  phone: "",
  specialty: "",
  teamSize: "4",
  district: "",
};

export default function ContractorsPage() {
  const { success, error } = useToast();
  const [contractors, setContractors] = useState<ContractorStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await userApi.contractorStats();
      setContractors(list);
    } catch {
      setContractors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const set = (key: keyof typeof defaultForm, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleCreate = async () => {
    setFormError(null);
    if (!form.name.trim() || !form.email.trim() || form.password.length < 8) {
      setFormError("Name and email are required; password must be at least 8 characters.");
      return;
    }
    setSaving(true);
    try {
      await userApi.create({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim() || undefined,
        role: "contractor",
        district: form.district || undefined,
        contractor: {
          specialty: form.specialty.trim() || undefined,
          teamSize: Number(form.teamSize) || undefined,
        },
      });
      success("Contractor added", "The new team can now accept assignments.");
      setCreateOpen(false);
      setForm(defaultForm);
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not create contractor.");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (c: ContractorStats) => {
    try {
      await userApi.update(c.id, { status: c.status === "active" ? "suspended" : "active" });
      success(c.status === "active" ? "Contractor suspended" : "Contractor activated", c.name);
      await load();
    } catch {
      error("Action failed", "Could not update contractor status.");
    }
  };

  const remove = async (c: ContractorStats) => {
    try {
      await userApi.remove(c.id);
      success("Contractor removed", c.name);
      await load();
    } catch {
      error("Removal failed", "Could not delete this contractor.");
    }
  };

  return (
    <div>
      <PageHeader
        title="Contractors"
        description="Repair teams assigned to road-damage jobs across the city."
        crumbs={[{ label: "Dashboard", to: "/admin" }, { label: "Contractors" }]}
        actions={
          <Button className="gap-2" onClick={() => setCreateOpen(true)}>
            <PlusCircle className="h-4 w-4" /> Add contractor
          </Button>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-52" />
          ))}
        </div>
      ) : contractors.length === 0 ? (
        <Card>
          <CardContent className="py-10">
            <EmptyState
              icon={<Users className="h-6 w-6" />}
              title="No contractors yet"
              description="Add a contractor team to start assigning verified complaints."
              action={
                <Button onClick={() => setCreateOpen(true)} className="gap-2">
                  <PlusCircle className="h-4 w-4" /> Add contractor
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {contractors.map((c, i) => {
            const total = c.assigned + c.completed;
            const pct = total > 0 ? Math.round((c.completed / total) * 100) : 0;
            const suspended = c.status === "suspended";
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
              >
                <Card className={suspended ? "opacity-60" : ""}>
                  <CardContent className="pt-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar name={c.name} size="lg" />
                        <div>
                          <p className="text-sm font-semibold text-foreground">{c.name}</p>
                          <p className="text-xs text-muted-foreground">{c.email}</p>
                        </div>
                      </div>
                      <DropdownMenu
                        align="end"
                        trigger={
                          <Button variant="ghost" size="icon-sm">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        }
                        items={[
                          { label: c.status === "active" ? "Suspend" : "Activate", icon: <UserX className="h-4 w-4" />, onClick: () => void toggleStatus(c) },
                          { label: "Remove", icon: <Truck className="h-4 w-4" />, danger: true, onClick: () => void remove(c) },
                        ]}
                      />
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <Badge variant={suspended ? "danger" : "success"} className="capitalize">
                        {c.status}
                      </Badge>
                      {c.contractor?.specialty && (
                        <Badge variant="muted">{c.contractor.specialty}</Badge>
                      )}
                      {c.district && <Badge variant="muted">{c.district}</Badge>}
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-3 border-y border-border py-3 text-center">
                      <div>
                        <p className="text-xl font-bold text-foreground">{c.inProgress}</p>
                        <p className="text-xs text-muted-foreground">Active</p>
                      </div>
                      <div>
                        <p className="text-xl font-bold text-foreground">{c.completed}</p>
                        <p className="text-xs text-muted-foreground">Completed</p>
                      </div>
                      <div>
                        <p className="text-xl font-bold text-foreground">{total}</p>
                        <p className="text-xs text-muted-foreground">Total jobs</p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="mb-1.5 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Completion</span>
                        <span className="font-semibold text-foreground">{pct}%</span>
                      </div>
                      <Progress value={pct} indicatorClassName={pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-primary" : "bg-amber-500"} />
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 text-amber-400" />
                        {c.contractor?.rating ? `${c.contractor.rating.toFixed(1)} rating` : "No ratings yet"}
                      </span>
                      <span>{formatDate(c.createdAt)}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <Dialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Add contractor"
        description="Create a new repair team account for road maintenance work."
        footer={
          <>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={saving}>
              <CheckCircle2 className="h-4 w-4" /> Create contractor
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {formError && <FormError message={formError} />}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" required>
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Team name" />
            </Field>
            <Field label="Email" required>
              <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="contractor@city.gov.in" />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Temporary password" required hint="At least 8 characters">
              <Input type="password" value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="••••••••" />
            </Field>
            <Field label="Phone">
              <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 …" />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Specialty">
              <Input value={form.specialty} onChange={(e) => set("specialty", e.target.value)} placeholder="e.g. Asphalt repair" />
            </Field>
            <Field label="Team size">
              <Input type="number" min={1} value={form.teamSize} onChange={(e) => set("teamSize", e.target.value)} />
            </Field>
          </div>
          <Field label="Service district">
            <Select
              value={form.district}
              onChange={(v) => set("district", v)}
              placeholder="Select district"
              options={DISTRICT_NAMES.map((d) => ({ value: d, label: d }))}
            />
          </Field>
        </div>
      </Dialog>
    </div>
  );
}
