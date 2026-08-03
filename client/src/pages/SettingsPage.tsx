import { useState, type FormEvent } from "react";
import { KeyRound, MonitorSmartphone, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Field, FormError } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/shared/page-header";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { authApi } from "@/services";

export default function SettingsPage() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(false);
  const [aiPreview, setAiPreview] = useState(true);

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (newPassword.length < 8) {
      setFormError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setFormError("New passwords do not match.");
      return;
    }
    setSaving(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      success("Password updated", "Your password has been changed successfully.");
    } catch (err) {
      error("Password change failed", "Please check your current password and try again.");
      setFormError(err instanceof Error ? err.message : "Could not change password.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Settings"
        description="Manage your password, preferences and notifications."
        crumbs={[{ label: "Home", to: "/dashboard" }, { label: "Settings" }]}
      />

      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex-row items-center gap-3 space-y-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Change password</CardTitle>
              <CardDescription>Use a strong password you don't use anywhere else.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-5">
              {formError && <FormError message={formError} />}
              <Field label="Current password" required>
                <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="New password" required hint="At least 8 characters">
                  <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" autoComplete="new-password" />
                </Field>
                <Field label="Confirm new password" required>
                  <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" autoComplete="new-password" />
                </Field>
              </div>
              <div className="flex justify-end">
                <Button type="submit" loading={saving}>
                  Update password
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center gap-3 space-y-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <MonitorSmartphone className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Choose how you want to hear about your reports.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="flex items-center justify-between gap-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">In-app updates</p>
                <p className="text-xs text-muted-foreground">Always on — status changes for your reports.</p>
              </div>
              <div className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">On</div>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-border py-3">
              <div>
                <p className="text-sm font-medium text-foreground">Email updates</p>
                <p className="text-xs text-muted-foreground">Get notified by email when your report changes.</p>
              </div>
              <Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} />
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-border py-3">
              <div>
                <p className="text-sm font-medium text-foreground">SMS alerts</p>
                <p className="text-xs text-muted-foreground">Critical updates via SMS (requires phone number).</p>
              </div>
              <Switch checked={smsNotifs} onCheckedChange={setSmsNotifs} />
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-border py-3">
              <div>
                <p className="text-sm font-medium text-foreground">AI previews</p>
                <p className="text-xs text-muted-foreground">Show AI detection details on the dashboard.</p>
              </div>
              <Switch checked={aiPreview} onCheckedChange={setAiPreview} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center gap-3 space-y-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Account & security</CardTitle>
              <CardDescription>Account details for {user?.email}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between rounded-lg bg-muted/50 px-3.5 py-3">
              <span className="text-muted-foreground">Account status</span>
              <span className="font-semibold capitalize text-foreground">{user?.status}</span>
            </div>
            <div className="flex justify-between rounded-lg bg-muted/50 px-3.5 py-3">
              <span className="text-muted-foreground">Role</span>
              <span className="font-semibold capitalize text-foreground">{user?.role?.replace("_", " ")}</span>
            </div>
            <div className="flex justify-between rounded-lg bg-muted/50 px-3.5 py-3">
              <span className="text-muted-foreground">Session</span>
              <span className="font-semibold text-foreground">Active device</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
