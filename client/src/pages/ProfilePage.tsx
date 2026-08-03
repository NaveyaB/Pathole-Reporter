import { useState, type FormEvent } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Field, FormError } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { authApi } from "@/services";
import { DISTRICT_NAMES } from "@/constants";
import { formatDate, initials } from "@/lib/utils";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { success, error } = useToast();
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [address, setAddress] = useState(user?.address ?? "");
  const [district, setDistrict] = useState(user?.district ?? "");
  const [specialty, setSpecialty] = useState(user?.contractor?.specialty ?? "");
  const [teamSize, setTeamSize] = useState(user?.contractor?.teamSize?.toString() ?? "");

  const isContractor = user?.role === "contractor";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!name.trim()) {
      setFormError("Name is required.");
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: name.trim(),
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        district: district || undefined,
      };
      if (isContractor) {
        payload.contractor = {
          ...(user?.contractor ?? {}),
          specialty: specialty.trim() || undefined,
          teamSize: teamSize ? Number(teamSize) : undefined,
        };
      }
      await authApi.updateProfile(payload);
      await refreshUser();
      success("Profile updated", "Your details have been saved successfully.");
    } catch (err) {
      error("Update failed", "Could not update your profile. Please try again.");
      setFormError(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="My profile"
        description="Manage your personal information and contact details."
        crumbs={[{ label: "Home", to: "/dashboard" }, { label: "Profile" }]}
      />

      <Card className="mb-6 overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
        <CardContent className="-mt-10">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="rounded-2xl border-4 border-white shadow-lg">
                <Avatar name={user?.name} size="lg" src={user?.avatar} />
              </div>
              <div className="pb-1">
                <h2 className="text-xl font-bold text-foreground">{user?.name}</h2>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 pb-1">
              <Badge variant={user?.status === "active" ? "success" : "danger"} className="capitalize">
                {user?.status}
              </Badge>
              <Badge variant="secondary" className="capitalize">
                {user?.role?.replace("_", " ")}
              </Badge>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-5 sm:grid-cols-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Member since</p>
              <p className="mt-1 text-sm font-semibold text-foreground">{formatDate(user?.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Phone</p>
              <p className="mt-1 text-sm font-semibold text-foreground">{user?.phone ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">District</p>
              <p className="mt-1 text-sm font-semibold text-foreground">{user?.district ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Verified</p>
              <p className="mt-1 text-sm font-semibold text-foreground">{user?.verified ? "Yes" : "No"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Edit details</CardTitle>
          <CardDescription>Update the information shown to admins and on your reports.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {formError && <FormError message={formError} />}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" required>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
              </Field>
              <Field label="Phone">
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 …" />
              </Field>
            </div>
            <Field label="Address">
              <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, area, city" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="District">
                <Select
                  value={district}
                  onChange={setDistrict}
                  placeholder="Select district"
                  options={[{ value: "", label: "Not specified" }, ...DISTRICT_NAMES.map((d) => ({ value: d, label: d }))]}
                />
              </Field>
              {isContractor && (
                <Field label="Specialty">
                  <Input value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder="e.g. Asphalt repair" />
                </Field>
              )}
            </div>
            {isContractor && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Team size">
                  <Input type="number" min={1} value={teamSize} onChange={(e) => setTeamSize(e.target.value)} placeholder="e.g. 5" />
                </Field>
              </div>
            )}
            <div className="flex justify-end gap-3 border-t border-border pt-5">
              <Button type="button" variant="outline" onClick={() => window.history.back()}>
                Cancel
              </Button>
              <Button type="submit" loading={saving}>
                Save changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
