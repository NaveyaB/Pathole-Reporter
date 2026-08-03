import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Calendar,
  CheckCircle2,
  Clock,
  Hammer,
  ImageIcon,
  MapPin,
  Phone,
  Play,
  ShieldCheck,
  Star,
  Truck,
  User as UserIcon,
  X,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Dialog } from "@/components/ui/dialog";
import { Field, FormError } from "@/components/ui/form-field";
import { Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge, PriorityBadge, SeverityBadge, TypeBadge } from "@/components/shared/badges";
import { AICard } from "@/components/shared/ai-card";
import { ComplaintMap, type MapPoint } from "@/components/maps/complaint-map";
import { PageHeader } from "@/components/shared/page-header";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { complaintApi, userApi } from "@/services";
import { STATUS_META, STATUS_ORDER, REPAIR_TYPES } from "@/constants";
import { formatDate, formatDateTime, formatDuration, titleCase } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Complaint, ContractorStats } from "@/types";

export default function ComplaintDetailPage() {
  const { reportNumber = "" } = useParams();
  const { user, role } = useAuth();
  const { success } = useToast();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const [assignOpen, setAssignOpen] = useState(false);
  const [contractors, setContractors] = useState<ContractorStats[]>([]);
  const [contractorId, setContractorId] = useState("");
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [completeOpen, setCompleteOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [repairType, setRepairType] = useState("");
  const [afterFiles, setAfterFiles] = useState<File[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);

  const isAdmin = role === "admin" || role === "super_admin";
  const isContractor = role === "contractor";
  const isReporter = complaint?.reporter === user?.id;
  const isAssignedContractor = complaint?.assignedContractor === user?.id;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await complaintApi.byNumber(reportNumber);
      setComplaint(data);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [reportNumber]);

  useEffect(() => {
    void load();
  }, [load]);

  const mapPoint: MapPoint | null = useMemo(
    () =>
      complaint
        ? {
            id: complaint.id,
            reportNumber: complaint.reportNumber,
            title: complaint.title,
            location: complaint.location,
            district: complaint.district,
            status: complaint.status,
            priority: complaint.priority,
            severity: complaint.aiAnalysis?.severity,
            type: complaint.type,
            createdAt: complaint.timestamps.created,
          }
        : null,
    [complaint]
  );

  const openAssign = async () => {
    setActionError(null);
    setAssignOpen(true);
    if (contractors.length === 0) {
      try {
        const list = await userApi.contractorStats();
        setContractors(list.filter((c) => c.status === "active"));
        if (list.length === 0) setActionError("No active contractors available.");
      } catch {
        setActionError("Could not load contractors.");
      }
    }
  };

  const handleVerify = async () => {
    setBusy(true);
    setActionError(null);
    try {
      const updated = await complaintApi.verify(reportNumber);
      setComplaint(updated);
      success("Complaint verified", `${reportNumber} is now queued for repair.`);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Verification failed.");
    } finally {
      setBusy(false);
    }
  };

  const handleAssign = async () => {
    if (!contractorId) {
      setActionError("Select a contractor to assign.");
      return;
    }
    setBusy(true);
    setActionError(null);
    try {
      const updated = await complaintApi.assign(reportNumber, contractorId);
      setComplaint(updated);
      setAssignOpen(false);
      success("Contractor assigned", `${reportNumber} is now being handled.`);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Assignment failed.");
    } finally {
      setBusy(false);
    }
  };

  const handleReject = async () => {
    setBusy(true);
    setActionError(null);
    try {
      const updated = await complaintApi.reject(reportNumber, rejectReason || "Rejected by municipality");
      setComplaint(updated);
      setRejectOpen(false);
      setRejectReason("");
      success("Complaint rejected", "The reporter has been notified.");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Rejection failed.");
    } finally {
      setBusy(false);
    }
  };

  const handleStartWork = async () => {
    setBusy(true);
    setActionError(null);
    try {
      const updated = await complaintApi.updateStatus(reportNumber, "in_progress");
      setComplaint(updated);
      success("Work started", "Status updated to in progress.");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Could not start work.");
    } finally {
      setBusy(false);
    }
  };

  const handleComplete = async () => {
    if (afterFiles.length === 0) {
      setActionError("Add at least one after-repair photo.");
      return;
    }
    setBusy(true);
    setActionError(null);
    try {
      const formData = new FormData();
      afterFiles.forEach((f) => formData.append("images", f));
      formData.append("notes", notes || "Repair completed.");
      formData.append("repairType", repairType || "asphalt-patching");
      const updated = await complaintApi.complete(reportNumber, formData);
      setComplaint(updated);
      setCompleteOpen(false);
      setAfterFiles([]);
      setNotes("");
      success("Repair completed", "The citizen has been notified.");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Could not complete repair.");
    } finally {
      setBusy(false);
    }
  };

  const handleFeedback = async () => {
    setBusy(true);
    setActionError(null);
    try {
      const updated = await complaintApi.feedback(reportNumber, rating, feedbackComment || undefined);
      setComplaint(updated);
      setFeedbackOpen(false);
      setFeedbackComment("");
      success("Thanks for your feedback", "Your rating helps us improve.");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Could not submit feedback.");
    } finally {
      setBusy(false);
    }
  };

  const backPath = isAdmin ? "/admin/complaints" : isContractor ? "/contractor/jobs" : "/complaints";

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Skeleton className="h-72" />
          </div>
          <Skeleton className="h-72" />
        </div>
      </div>
    );
  }

  if (notFound || !complaint) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <XCircle className="h-12 w-12 text-muted-foreground/40" />
        <div>
          <h2 className="text-lg font-semibold text-foreground">Complaint not found</h2>
          <p className="mt-1 text-sm text-muted-foreground">This report may have been removed or you don't have access.</p>
        </div>
        <Link to={backPath}>
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to complaints
          </Button>
        </Link>
      </div>
    );
  }

  const images = complaint.images;
  const completion = complaint.completion;
  const stepIndex = STATUS_ORDER.indexOf(complaint.status);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title={
          <span className="flex items-center gap-3">
            {complaint.reportNumber}
            <StatusBadge status={complaint.status} />
          </span>
        }
        description={complaint.title}
        crumbs={[{ label: "Complaints", to: backPath }, { label: complaint.reportNumber }]}
        actions={
          <>
            <Link to={backPath}>
              <Button variant="outline" size="sm" className="gap-1.5">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            </Link>
            {isAdmin && (
              <>
                {(complaint.status === "submitted" || complaint.status === "under_review") && (
                  <Button size="sm" className="gap-1.5" onClick={handleVerify} loading={busy}>
                    <BadgeCheck className="h-4 w-4" /> Verify
                  </Button>
                )}
                {complaint.status === "verified" && (
                  <Button size="sm" className="gap-1.5" onClick={openAssign}>
                    <Truck className="h-4 w-4" /> Assign contractor
                  </Button>
                )}
                {(complaint.status === "assigned" || complaint.status === "in_progress" || complaint.status === "verified") && (
                  <Button size="sm" variant="danger" className="gap-1.5" onClick={() => setRejectOpen(true)}>
                    <X className="h-4 w-4" /> Reject
                  </Button>
                )}
              </>
            )}
            {isContractor && isAssignedContractor && complaint.status === "assigned" && (
              <Button size="sm" className="gap-1.5" onClick={handleStartWork} loading={busy}>
                <Play className="h-4 w-4" /> Start work
              </Button>
            )}
            {isContractor && isAssignedContractor && complaint.status === "in_progress" && (
              <Button size="sm" variant="success" className="gap-1.5" onClick={() => setCompleteOpen(true)}>
                <CheckCircle2 className="h-4 w-4" /> Mark complete
              </Button>
            )}
            {isReporter && complaint.status === "completed" && !complaint.feedback && (
              <Button size="sm" className="gap-1.5" onClick={() => setFeedbackOpen(true)}>
                <Star className="h-4 w-4" /> Rate repair
              </Button>
            )}
          </>
        }
      />

      {complaint.duplicateOf && complaint.duplicate && (
        <Alert variant="warning" title="Duplicate report">
          <p className="text-sm">
            This report was flagged as a duplicate of{" "}
            <Link to={`${isAdmin ? "/admin" : ""}/complaints/${complaint.duplicate.reportNumber}`} className="font-semibold underline">
              {complaint.duplicate.reportNumber}
            </Link>
            . The original report is being tracked instead.
          </p>
        </Alert>
      )}

      {complaint.status === "rejected" && (
        <Alert variant="danger" title="Rejected">
          <p className="text-sm">{complaint.rejectedReason ?? "No reason provided."}</p>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              {images.length > 0 ? (
                <div className="relative">
                  <img
                    src={images[previewIndex].url}
                    alt={complaint.title}
                    className="h-72 w-full rounded-t-xl object-cover"
                  />
                  {images.length > 1 && (
                    <div className="absolute bottom-3 right-3 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white backdrop-blur">
                      {previewIndex + 1} / {images.length}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex h-48 w-full items-center justify-center rounded-t-xl bg-muted">
                  <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
                </div>
              )}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto border-t border-border p-3 scrollbar-thin">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setPreviewIndex(i)}
                      className={cn(
                        "h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                        i === previewIndex ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
                      )}
                    >
                      <img src={img.url} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {complaint.aiAnalysis && (
            <AICard analysis={complaint.aiAnalysis} />
          )}

          <Card>
            <CardHeader>
              <CardTitle>Repair progress</CardTitle>
              <CardDescription>Current stage of this report</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative space-y-0">
                {STATUS_ORDER.map((s, i) => {
                  const meta = STATUS_META[s];
                  const reached = complaint.status === s || stepIndex > i;
                  const isCurrent = complaint.status === s;
                  return (
                    <div key={s} className="relative flex gap-3.5">
                      {i < STATUS_ORDER.length - 1 && (
                        <span
                          className={cn(
                            "absolute left-[13px] top-8 h-full w-px",
                            stepIndex > i ? "bg-emerald-300" : "bg-border"
                          )}
                        />
                      )}
                      <span
                        className={cn(
                          "relative z-10 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2",
                          reached ? "border-emerald-400 bg-emerald-50 text-emerald-600" : "border-border bg-white text-muted-foreground"
                        )}
                      >
                        {reached ? <CheckCircle2 className="h-4 w-4" /> : <span className="h-2 w-2 rounded-full bg-current" />}
                      </span>
                      <div className="pb-6">
                        <p className={cn("text-sm font-medium", isCurrent ? "font-semibold text-foreground" : reached ? "text-foreground" : "text-muted-foreground")}>
                          {meta.label}
                        </p>
                        {isCurrent && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {complaint.status === "assigned" && complaint.contractorUser ? (
                              <>Assigned to {complaint.contractorUser.name}</>
                            ) : complaint.status === "completed" ? (
                              <>Completed {formatDateTime(complaint.completedAt)}</>
                            ) : (
                              <>Current stage</>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Completion details</CardTitle>
            </CardHeader>
            <CardContent>
              {completion ? (
                <div className="space-y-4">
                  {completion.repairType && (
                    <div className="flex items-center gap-2 text-sm">
                      <Hammer className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">Repair method:</span>
                      <span className="font-medium text-foreground">{titleCase(completion.repairType)}</span>
                    </div>
                  )}
                  {completion.notes && <p className="text-sm text-muted-foreground">{completion.notes}</p>}
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    {completion.completedAt && (
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" /> Completed {formatDateTime(completion.completedAt)}
                      </span>
                    )}
                    {completion.durationHours != null && (
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-4 w-4" /> Repair took {formatDuration(completion.durationHours)}
                      </span>
                    )}
                  </div>
                  {completion.afterImages.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">After photos</p>
                      <div className="flex gap-2 overflow-x-auto scrollbar-thin">
                        {completion.afterImages.map((img, i) => (
                          <img key={i} src={img.url} alt="After repair" className="h-20 w-28 shrink-0 rounded-lg object-cover" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Completion details will appear here once the repair is finished.
                </p>
              )}
            </CardContent>
          </Card>

          {complaint.feedback && (
            <Card>
              <CardHeader>
                <CardTitle>Citizen feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn("h-5 w-5", i < complaint.feedback!.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30")}
                    />
                  ))}
                  <span className="ml-2 text-sm font-semibold text-foreground">{complaint.feedback.rating}/5</span>
                </div>
                {complaint.feedback.comment && (
                  <p className="mt-3 rounded-lg bg-muted/50 p-3 text-sm text-foreground">"{complaint.feedback.comment}"</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-4 pt-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">Details</h3>
                <Badge variant="muted" className="font-mono">{complaint.reportNumber}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Type</p>
                  <div className="mt-1"><TypeBadge type={complaint.type} /></div>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Priority</p>
                  <div className="mt-1"><PriorityBadge priority={complaint.priority} /></div>
                </div>
                {complaint.aiAnalysis && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Severity</p>
                    <div className="mt-1"><SeverityBadge severity={complaint.aiAnalysis.severity} /></div>
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">District</p>
                  <p className="mt-1 text-sm font-medium text-foreground">{complaint.district ?? "—"}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 border-t border-border pt-3 text-sm">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">{complaint.address ?? "Address not specified"}</p>
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                    {complaint.location.lat.toFixed(5)}, {complaint.location.lng.toFixed(5)}
                  </p>
                </div>
              </div>
              {complaint.description && (
                <div className="border-t border-border pt-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Description</p>
                  <p className="mt-1 text-sm text-foreground">{complaint.description}</p>
                </div>
              )}
              <div className="flex items-center gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" /> Reported {formatDateTime(complaint.timestamps.created)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 pt-5">
              <h3 className="text-sm font-semibold text-foreground">People</h3>
              <div className="flex items-center gap-3">
                <Avatar name={complaint.reporterUser?.name ?? "?"} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1 text-sm font-medium text-foreground">
                    <UserIcon className="h-3.5 w-3.5 text-muted-foreground" /> {complaint.reporterUser?.name ?? "Citizen"}
                  </p>
                  {complaint.reporterUser?.phone && (
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" /> {complaint.reporterUser.phone}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 border-t border-border pt-3">
                <Avatar name={complaint.contractorUser?.name ?? "?"} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1 text-sm font-medium text-foreground">
                    <Truck className="h-3.5 w-3.5 text-muted-foreground" /> {complaint.contractorUser?.name ?? "Not assigned"}
                  </p>
                  {complaint.contractorUser?.contractor?.specialty && (
                    <p className="mt-0.5 text-xs text-muted-foreground">{complaint.contractorUser.contractor.specialty}</p>
                  )}
                </div>
              </div>
              {complaint.verifiedBy && (
                <div className="flex items-center gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  Verified by the municipality {complaint.verifiedAt ? `on ${formatDate(complaint.verifiedAt)}` : ""}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 pt-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">Location</h3>
                <Link to={`/map`} className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                  Open map <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              {mapPoint && (
                <ComplaintMap points={[mapPoint]} height={220} center={[mapPoint.location.lat, mapPoint.location.lng]} zoom={15} />
              )}
            </CardContent>
          </Card>

          {actionError && (
            <Alert variant="danger" title="Something went wrong">
              <p className="text-sm">{actionError}</p>
            </Alert>
          )}
        </div>
      </div>

      {/* Assign dialog */}
      <Dialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        title="Assign contractor"
        description="Choose the team responsible for repairing this road damage."
        footer={
          <>
            <Button variant="outline" onClick={() => setAssignOpen(false)}>Cancel</Button>
            <Button onClick={handleAssign} loading={busy} disabled={!contractorId}>
              Assign contractor
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {actionError && <FormError message={actionError} />}
          <Field label="Contractor" required>
            <Select
              value={contractorId}
              onChange={setContractorId}
              placeholder="Select contractor"
              options={contractors.map((c) => ({
                value: c.id,
                label: c.name,
                description: `${c.email} · ${c.inProgress} active · ${c.completed} completed`,
              }))}
            />
          </Field>
          <div className="grid max-h-52 gap-2 overflow-y-auto scrollbar-thin">
            {contractors.length === 0 && !actionError && (
              <p className="text-sm text-muted-foreground">Loading contractors…</p>
            )}
          </div>
        </div>
      </Dialog>

      {/* Reject dialog */}
      <Dialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        title="Reject complaint"
        description="Provide a reason — the citizen will be notified."
        footer={
          <>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleReject} loading={busy}>
              Reject complaint
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {actionError && <FormError message={actionError} />}
          <Field label="Reason" hint="e.g. Not a road damage issue, already reported, outside jurisdiction">
            <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Explain why this report is being rejected…" />
          </Field>
        </div>
      </Dialog>

      {/* Complete dialog */}
      <Dialog
        open={completeOpen}
        onOpenChange={setCompleteOpen}
        title="Complete repair"
        description="Upload after-repair photos to close this job."
        footer={
          <>
            <Button variant="outline" onClick={() => setCompleteOpen(false)}>Cancel</Button>
            <Button variant="success" onClick={handleComplete} loading={busy} disabled={afterFiles.length === 0}>
              Confirm completion
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {actionError && <FormError message={actionError} />}
          <Field label="After-repair photos" required hint="Add at least one photo showing the repaired road.">
            <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border bg-muted/30 px-4 py-6 text-center transition-colors hover:border-primary/50 hover:bg-primary/5">
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Click to upload photos</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => setAfterFiles(Array.from(e.target.files ?? []))}
              />
            </label>
          </Field>
          {afterFiles.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {afterFiles.map((f, i) => (
                <div key={i} className="flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                  <ImageIcon className="h-3.5 w-3.5" /> {f.name}
                </div>
              ))}
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Repair type">
              <Select
                value={repairType}
                onChange={setRepairType}
                placeholder="Select method"
                options={REPAIR_TYPES.map((r) => ({ value: r.value, label: r.label }))}
              />
            </Field>
          </div>
          <Field label="Notes">
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Brief summary of the repair work done…" />
          </Field>
        </div>
      </Dialog>

      {/* Feedback dialog */}
      <Dialog
        open={feedbackOpen}
        onOpenChange={setFeedbackOpen}
        title="Rate this repair"
        description="How well did the municipality handle your complaint?"
        footer={
          <>
            <Button variant="outline" onClick={() => setFeedbackOpen(false)}>Cancel</Button>
            <Button onClick={handleFeedback} loading={busy}>
              Submit feedback
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {actionError && <FormError message={actionError} />}
          <div className="flex items-center justify-center gap-1.5 py-2">
            {[1, 2, 3, 4, 5].map((v) => (
              <button key={v} type="button" onClick={() => setRating(v)} className="transition-transform hover:scale-110">
                <Star
                  className={cn("h-9 w-9", v <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30")}
                />
              </button>
            ))}
          </div>
          <Field label="Comment (optional)">
            <Textarea value={feedbackComment} onChange={(e) => setFeedbackComment(e.target.value)} placeholder="Tell us how the repair went…" />
          </Field>
        </div>
      </Dialog>
    </div>
  );
}
