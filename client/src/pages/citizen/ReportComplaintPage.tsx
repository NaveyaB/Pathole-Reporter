import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Brain,
  CheckCircle2,
  ImagePlus,
  Loader2,
  MapPin,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field } from "@/components/ui/form-field";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";
import { GoogleLocationPicker } from "@/components/maps/google-location-picker";
import { PageHeader } from "@/components/shared/page-header";
import { SeverityBadge, TypeBadge } from "@/components/shared/badges";
import { useToast } from "@/contexts/ToastContext";
import { aiApi, complaintApi } from "@/services";
import { TYPE_OPTIONS } from "@/constants";
import { titleCase } from "@/lib/utils";
import type { GeoPoint, RoadDamageType, ValidatedLocation } from "@/types";

const steps = [
  { id: 0, label: "Photos" },
  { id: 1, label: "AI analysis" },
  { id: 2, label: "Location" },
  { id: 3, label: "Details" },
];

interface AiResult {
  detected: RoadDamageType;
  severity: "low" | "medium" | "high" | "critical";
  confidence: number;
  recommendation: string;
  isRoadImage: boolean;
  tags: string[];
  model: string;
  imageUrl?: string;
}

export default function ReportComplaintPage() {
  const navigate = useNavigate();
  const { success } = useToast();
  const fileInput = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [ai, setAi] = useState<AiResult | null>(null);
  const [aiSkipped, setAiSkipped] = useState(false);
  const [draftLocation, setDraftLocation] = useState<ValidatedLocation | null>(null);
  const [confirmedLocation, setConfirmedLocation] = useState<ValidatedLocation | null>(null);
  const [reporterLocation, setReporterLocation] = useState<GeoPoint | null>(null);
  const [exactAddress, setExactAddress] = useState("");
  const [exactAddressTouched, setExactAddressTouched] = useState(false);
  const [exactAddressError, setExactAddressError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<RoadDamageType>("pothole");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  /**
   * Reverse-geocoded address → optional suggestion for the exact-address box.
   * It only pre-fills while the citizen hasn't typed anything (so a moving
   * marker never overwrites a manually entered address).
   */
  useEffect(() => {
    if (exactAddressTouched) return;
    const suggestion = draftLocation?.formattedAddress ?? draftLocation?.locality ?? "";
    if (!suggestion) return;
    setExactAddress((prev) => (prev && prev.trim() ? prev : suggestion));
  }, [draftLocation, exactAddressTouched]);

  const updateExactAddress = (value: string) => {
    setExactAddress(value);
    setExactAddressTouched(true);
    if (value.trim()) setExactAddressError(null);
  };

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const incoming = Array.from(list).slice(0, 6 - files.length);
    if (incoming.length === 0) return;
    const next = [...files, ...incoming];
    setFiles(next);
    setPreviews((prev) => [...prev, ...incoming.map((f) => URL.createObjectURL(f))]);
    setAi(null);
    setAiSkipped(false);
    setErrorMsg(null);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    setAi(null);
    setAiSkipped(false);
  };

  const runAnalysis = async () => {
    if (files.length === 0) {
      setErrorMsg("Add at least one photo to run the AI analysis.");
      return;
    }
    setAnalyzing(true);
    setErrorMsg(null);
    try {
      const formData = new FormData();
      formData.append("image", files[0]);
      const res = await aiApi.analyze(formData);
      setAi({
        detected: res.detected as RoadDamageType,
        severity: res.severity as AiResult["severity"],
        confidence: res.confidence,
        recommendation: res.recommendation,
        isRoadImage: res.isRoadImage,
        tags: res.tags ?? [],
        model: res.model,
        imageUrl: res.imageUrl,
      });
      setType(res.detected as RoadDamageType);
      setStep(2);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Analysis failed. Check the API server is running.");
    } finally {
      setAnalyzing(false);
    }
  };

  const skipAnalysis = () => {
    setAiSkipped(true);
    setErrorMsg(null);
    setStep(2);
  };

  const submit = async () => {
    setErrorMsg(null);
    if (files.length === 0) {
      setErrorMsg("Please add at least one photo.");
      setStep(0);
      return;
    }
    if (!confirmedLocation) {
      setErrorMsg("Please confirm the location on the map.");
      setStep(2);
      return;
    }
    if (!title.trim()) {
      setErrorMsg("Please give your report a short title.");
      setStep(3);
      return;
    }

    const potholePoint = { lat: confirmedLocation.lat, lng: confirmedLocation.lng };

    if (!exactAddress.trim()) {
      setExactAddressError("Please enter the exact address where the pothole is located.");
      setErrorMsg("Please enter the exact pothole address before submitting.");
      setStep(2);
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("images", f));
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("location", JSON.stringify(potholePoint));
      formData.append("exactAddress", exactAddress.trim());
      formData.append("formattedAddress", confirmedLocation.formattedAddress ?? "");
      formData.append("address", confirmedLocation.formattedAddress ?? "");
      formData.append("district", confirmedLocation.district ?? "");
      formData.append("locality", confirmedLocation.locality ?? "");
      formData.append("city", confirmedLocation.city ?? "");
      formData.append("placeId", confirmedLocation.placeId ?? "");
      formData.append("confirmed", "true");
      if (reporterLocation) formData.append("reporterLocation", JSON.stringify(reporterLocation));
      formData.append("type", type);
      const complaint = await complaintApi.create(formData);
      success("Complaint submitted", `${complaint.reportNumber} is now in review.`);
      navigate(`/complaints/${complaint.reportNumber}`);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Could not submit your complaint.");
    } finally {
      setSubmitting(false);
    }
  };

  const locationConfirmed = useMemo(
    () =>
      confirmedLocation != null &&
      draftLocation != null &&
      confirmedLocation.lat === draftLocation.lat &&
      confirmedLocation.lng === draftLocation.lng,
    [confirmedLocation, draftLocation]
  );

  const canGoNext = useMemo(() => {
    if (step === 0) return files.length > 0;
    if (step === 1) return true;
    if (step === 2) return locationConfirmed && exactAddress.trim().length > 0;
    if (step === 3) return title.trim().length > 0;
    return true;
  }, [step, files, locationConfirmed, exactAddress, title]);

  const next = () => {
    setErrorMsg(null);
    if (step === 0) {
      if (files.length === 0) {
        setErrorMsg("Add at least one photo first.");
        return;
      }
      setStep(1);
      return;
    }
    if (step === 1) {
      if (!ai && !aiSkipped) {
        runAnalysis();
        return;
      }
      setStep(2);
      return;
    }
    if (step === 2) {
      if (!locationConfirmed) {
        setErrorMsg("Search, pin, or drag the marker to the exact spot, then confirm the location.");
        return;
      }
      if (!exactAddress.trim()) {
        setExactAddressError("Please enter the exact address where the pothole is located.");
        setErrorMsg("Please enter the exact pothole address before continuing.");
        return;
      }
      setStep(3);
      return;
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Report road damage"
        description="Take a photo, drop a pin, and let our AI assess the severity."
        crumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Report damage" }]}
      />

      <div className="mb-6 flex items-center gap-1">
        {steps.map((s, i) => (
          <div key={s.id} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="flex w-full items-center">
              <div className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-border"}`} />
            </div>
            <span
              className={`text-xs font-medium ${
                i === step ? "text-primary" : i < step ? "text-emerald-600" : "text-muted-foreground"
              }`}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="pt-5">
          {errorMsg && (
            <div className="mb-5">
              <Alert variant="danger" title="Please check the following">
                <p className="text-sm">{errorMsg}</p>
              </Alert>
            </div>
          )}

          {/* Step 0: photos */}
          {step === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => addFiles(e.target.files)}
              />
              {previews.length === 0 ? (
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  className="flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/30 px-6 py-14 text-center transition-colors hover:border-primary/50 hover:bg-primary/5"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <ImagePlus className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Upload road photos</p>
                    <p className="mt-1 text-sm text-muted-foreground">Click to browse · JPG or PNG · up to 6 photos</p>
                  </div>
                </button>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {previews.map((src, i) => (
                    <div key={i} className="group relative aspect-video overflow-hidden rounded-lg border border-border">
                      <img src={src} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity hover:bg-rose-600 group-hover:opacity-100"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      {i === 0 && (
                        <span className="absolute bottom-1.5 left-1.5 rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-white">
                          Analyzed
                        </span>
                      )}
                    </div>
                  ))}
                  {previews.length < 6 && (
                    <button
                      type="button"
                      onClick={() => fileInput.current?.click()}
                      className="flex aspect-video items-center justify-center rounded-lg border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
                    >
                      <ImagePlus className="h-6 w-6" />
                    </button>
                  )}
                </div>
              )}
              <div className="flex justify-end">
                <Button onClick={next} disabled={!canGoNext}>
                  Continue <span className="ml-1">→</span>
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 1: AI analysis */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              {ai ? (
                <div className="space-y-5">
                  <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-emerald-800">Analysis complete</p>
                      <p className="text-xs text-emerald-700">
                        {ai.isRoadImage
                          ? `Detected ${ai.detected.replace("_", " ")} at ${ai.confidence}% confidence.`
                          : "This doesn't look like a road image — the report may be rejected."}
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-border p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Detected</p>
                      <div className="mt-2"><TypeBadge type={ai.detected} /></div>
                    </div>
                    <div className="rounded-lg border border-border p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Severity</p>
                      <div className="mt-2"><SeverityBadge severity={ai.severity} /></div>
                    </div>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      <Sparkles className="h-3.5 w-3.5 text-accent" /> AI recommendation
                    </p>
                    <p className="mt-2 text-sm text-foreground">{ai.recommendation}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {ai.tags.map((t) => (
                        <span key={t} className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                          {titleCase(t)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : analyzing ? (
                <div className="flex flex-col items-center justify-center gap-4 py-12">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Loader2 className="h-7 w-7 animate-spin" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-foreground">Analyzing photo…</p>
                    <p className="mt-1 text-sm text-muted-foreground">Our computer-vision model is assessing the damage.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-muted/30 px-6 py-10 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                      <Brain className="h-6 w-6" />
                    </div>
                    <div className="max-w-sm">
                      <p className="text-sm font-medium text-foreground">Run the AI analysis</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Uses a fine-tuned YOLOv8 road-damage model to detect potholes, cracks, ruts and more — with severity assessment.
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={skipAnalysis}>
                      Skip analysis
                    </Button>
                    <Button onClick={runAnalysis} loading={analyzing}>
                      <Brain className="h-4 w-4" /> Analyze photo
                    </Button>
                  </div>
                </div>
              )}
              {ai && (
                <div className="flex justify-end">
                  <Button onClick={next}>Continue <span className="ml-1">→</span></Button>
                </div>
              )}
              {aiSkipped && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
                    <p className="text-sm text-muted-foreground">AI analysis skipped — severity will be assessed by the municipality.</p>
                    <Button size="sm" variant="outline" onClick={runAnalysis}>
                      Analyze now
                    </Button>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={next}>Continue <span className="ml-1">→</span></Button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 2: location */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <div>
                <p className="font-medium text-foreground">Pin the exact pothole location</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Search any town in Tamil Nadu, tap the map, or use your GPS. The precise spot is reverse-geocoded
                  and validated against the Tamil Nadu boundary before you continue — remote reporting is allowed
                  anywhere in the state.
                </p>
              </div>

              <GoogleLocationPicker
                confirmedLocation={confirmedLocation}
                initial={confirmedLocation ?? draftLocation}
                onDraft={(loc) => {
                  setDraftLocation(loc);
                  if (
                    confirmedLocation &&
                    (confirmedLocation.lat !== loc.lat || confirmedLocation.lng !== loc.lng)
                  ) {
                    setConfirmedLocation(null);
                  }
                }}
                onConfirm={setConfirmedLocation}
                onConfirmReset={() => setConfirmedLocation(null)}
                onReporterLocation={setReporterLocation}
                exactAddress={exactAddress}
                onExactAddressChange={updateExactAddress}
                exactAddressError={exactAddressError}
                height={360}
              />

              {locationConfirmed && confirmedLocation && (
                <Alert variant="success" title="Location confirmed">
                  <p className="text-sm">
                    {confirmedLocation.formattedAddress ??
                      `${confirmedLocation.lat.toFixed(5)}, ${confirmedLocation.lng.toFixed(5)}`}
                    {confirmedLocation.district ? ` · ${confirmedLocation.district} district` : ""}
                  </p>
                </Alert>
              )}

              <div className="flex justify-end">
                <Button onClick={next} disabled={!canGoNext}>
                  Continue <span className="ml-1">→</span>
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: details */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <Field label="Title" required>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Large pothole on Road No 12"
                  maxLength={120}
                />
              </Field>
              <Field label="Damage type" hint={ai ? "Pre-filled from AI detection — adjust if needed." : "Helps route the report to the right team."}>
                <Select
                  value={type}
                  onChange={setType}
                  options={TYPE_OPTIONS.map((t) => ({ value: t, label: titleCase(t) }))}
                />
              </Field>
              <Field label="Description">
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="How severe is it? Any hazards for vehicles or pedestrians? How long has it been there?"
                  maxLength={1000}
                />
              </Field>
              <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div className="min-w-0 text-sm">
                  <p className="font-medium text-foreground">
                    {exactAddress.trim() ||
                      (confirmedLocation?.formattedAddress ?? confirmedLocation?.locality ?? "Location not confirmed")}
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                    {confirmedLocation
                      ? `${confirmedLocation.lat.toFixed(5)}, ${confirmedLocation.lng.toFixed(5)}`
                      : "No location"}
                  </p>
                </div>
              </div>
              <div className="flex justify-between border-t border-border pt-5">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button onClick={submit} loading={submitting} size="lg" className="gap-2">
                  <Send className="h-4 w-4" /> Submit report
                </Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
