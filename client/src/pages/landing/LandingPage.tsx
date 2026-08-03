import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Bell,
  Brain,
  Building2,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  FileBarChart,
  MapPin,
  Radar,
  Route,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  UserRound,
  Wrench,
} from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.55, ease: "easeOut" as const },
};

const FEATURES = [
  {
    icon: <Brain className="h-5 w-5" />,
    title: "AI Damage Detection",
    text: "YOLOv8-powered computer vision instantly identifies potholes, cracks and surface damage from citizen photos.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: <Radar className="h-5 w-5" />,
    title: "Duplicate Prevention",
    text: "Geo-fencing and image similarity scoring collapse repeat reports into a single trackable case.",
    color: "bg-violet-50 text-violet-600",
  },
  {
    icon: <MapPin className="h-5 w-5" />,
    title: "Live Complaint Map",
    text: "An interactive GIS map with marker clustering, heat data and district-level filters for full visibility.",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: <ClipboardCheck className="h-5 w-5" />,
    title: "Smart Workflow",
    text: "A transparent pipeline from submission → verification → assignment → repair → feedback.",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: <FileBarChart className="h-5 w-5" />,
    title: "Analytics & Reports",
    text: "Trend charts, contractor performance, repair SLA and AI accuracy metrics in one dashboard.",
    color: "bg-rose-50 text-rose-600",
  },
  {
    icon: <Bell className="h-5 w-5" />,
    title: "Real-time Alerts",
    text: "Citizens and contractors get instant notifications at every stage of the repair journey.",
    color: "bg-sky-50 text-sky-600",
  },
];

const STEPS = [
  { icon: <Camera className="h-5 w-5" />, title: "Report in 60 seconds", text: "Snap a photo, drop a pin, describe the damage." },
  { icon: <Brain className="h-5 w-5" />, title: "AI analyzes instantly", text: "Type, severity, confidence and repair priority are computed automatically." },
  { icon: <Truck className="h-5 w-5" />, title: "Contractor repairs", text: "Municipality verifies, assigns and tracks repair to completion." },
];

const WORKFLOW = [
  { label: "Citizen submits", icon: <Camera className="h-4 w-4" />, state: "done" },
  { label: "AI analyzes", icon: <Brain className="h-4 w-4" />, state: "done" },
  { label: "Admin verifies", icon: <ShieldCheck className="h-4 w-4" />, state: "done" },
  { label: "Contractor assigned", icon: <Truck className="h-4 w-4" />, state: "done" },
  { label: "Repair completed", icon: <Wrench className="h-4 w-4" />, state: "active" },
  { label: "Feedback", icon: <Star className="h-4 w-4" />, state: "todo" },
];

const ROLES = [
  {
    role: "Citizens",
    icon: <UserRound className="h-5 w-5" />,
    color: "from-sky-500 to-blue-600",
    points: ["Report damage with photo + GPS", "Track progress live", "Get notified on completion", "Rate the repair quality"],
  },
  {
    role: "Municipal Admin",
    icon: <Building2 className="h-5 w-5" />,
    color: "from-blue-600 to-indigo-600",
    points: ["Review AI analysis", "Verify & prioritize", "Assign contractors", "Monitor performance & analytics"],
  },
  {
    role: "Contractors",
    icon: <Wrench className="h-5 w-5" />,
    color: "from-emerald-500 to-teal-600",
    points: ["View assigned work on map", "Navigate to job sites", "Upload before/after photos", "Update repair status"],
  },
];

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.9], [1, 0.2]);

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-glow">
              <svg viewBox="0 0 64 64" className="h-6 w-6" fill="none">
                <path d="M18 40h28v6a2 2 0 0 1-2 2H20a2 2 0 0 1-2-2v-6Z" fill="#F59E0B" />
                <path d="M16 38c0-8 6-14 14-14h4c8 0 14 6 14 14H16Z" fill="#fff" />
                <circle cx="26" cy="33" r="3" fill="#2563EB" />
                <circle cx="38" cy="33" r="3" fill="#2563EB" />
                <circle cx="32" cy="33" r="3.5" fill="#EF4444" />
              </svg>
            </div>
            <div className="leading-tight">
              <p className="text-[15px] font-bold text-foreground">Smart Pothole Reporter</p>
              <p className="text-[11px] font-medium text-primary">AI-Based Road Damage Management</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            <a href="#features" className="transition-colors hover:text-foreground">Features</a>
            <a href="#how" className="transition-colors hover:text-foreground">How it works</a>
            <a href="#roles" className="transition-colors hover:text-foreground">For everyone</a>
            <a href="#ai" className="transition-colors hover:text-foreground">AI Engine</a>
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="hidden sm:inline-flex">
                Get started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section ref={heroRef} className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.12),transparent_55%)]" />
        <motion.div style={{ opacity: heroOpacity }} className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:px-8">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1.5 text-xs font-medium text-primary"
              >
                <Sparkles className="h-3.5 w-3.5" />
                AI-Powered Smart City Platform
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl"
              >
                Report road damage in <span className="bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">60 seconds</span>.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
                className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground"
              >
                Smart Pothole Reporter connects citizens, municipalities and contractors with AI-powered detection,
                live GIS tracking and transparent repair workflows — for safer roads.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
                className="mt-8 flex flex-wrap items-center gap-3"
              >
                <Link to="/register">
                  <Button size="lg" className="gap-2">
                    Report a pothole <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="gap-2">
                    Sign in with demo account
                  </Button>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-10 grid max-w-md grid-cols-3 gap-6"
              >
                {[
                  { value: "42+", label: "Live complaints" },
                  { value: "94%", label: "AI accuracy" },
                  { value: "< 4 days", label: "Avg. repair time" },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="text-2xl font-bold text-foreground">{s.value}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Hero visual */}
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative"
            >
              <div className="relative rounded-2xl border border-border bg-white p-5 shadow-2xl">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Municipal Overview</p>
                    <p className="text-xs text-muted-foreground">Live road-damage intelligence</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> Live
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Pending", value: "8", color: "text-amber-600" },
                    { label: "In repair", value: "6", color: "text-blue-600" },
                    { label: "Completed", value: "12", color: "text-emerald-600" },
                  ].map((card) => (
                    <div key={card.label} className="rounded-xl border border-border bg-muted/30 p-3">
                      <p className={cn("text-xl font-bold", card.color)}>{card.value}</p>
                      <p className="text-[11px] text-muted-foreground">{card.label}</p>
                    </div>
                  ))}
                </div>

                {/* Fake map */}
                <div className="relative mt-3 h-40 overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 via-emerald-50 to-slate-100">
                  <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
                  <svg viewBox="0 0 400 160" className="absolute inset-0 h-full w-full opacity-70">
                    <path d="M-10 120 Q 100 40 200 90 T 410 60" stroke="#94a3b8" strokeWidth="8" fill="none" />
                    <path d="M80 -10 Q 140 80 120 170" stroke="#cbd5e1" strokeWidth="6" fill="none" />
                    <path d="M260 -10 Q 300 70 280 170" stroke="#cbd5e1" strokeWidth="6" fill="none" />
                  </svg>
                  {[
                    { top: "22%", left: "30%", c: "#ef4444" },
                    { top: "58%", left: "62%", c: "#f59e0b" },
                    { top: "40%", left: "74%", c: "#0ea5e9" },
                    { top: "68%", left: "32%", c: "#22c55e" },
                    { top: "30%", left: "52%", c: "#f59e0b" },
                  ].map((m, i) => (
                    <motion.span
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.6 + i * 0.1, type: "spring" }}
                      className="absolute h-3.5 w-3.5 rounded-full border-2 border-white shadow"
                      style={{ top: m.top, left: m.left, background: m.c }}
                    />
                  ))}
                </div>

                {/* AI detection card */}
                <div className="mt-3 flex items-center gap-3 rounded-xl border border-primary/15 bg-primary/5 p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
                    <ScanSearch className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-foreground">AI Detection · SPR-1042</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">Pothole detected · High severity</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-600">94%</p>
                    <p className="text-[10px] text-muted-foreground">confidence</p>
                  </div>
                </div>
              </div>

              {/* Floating chips */}
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="absolute -left-6 -top-5 hidden rounded-xl border border-border bg-white px-4 py-3 shadow-xl sm:block"
              >
                <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Repair completed
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">City Paving Co · 2 days</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.85 }}
                className="absolute -bottom-5 -right-4 hidden rounded-xl border border-border bg-white px-4 py-3 shadow-xl sm:block"
              >
                <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <Bell className="h-4 w-4 text-blue-500" /> New notification
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">Your complaint was verified</p>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="border-y border-border bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Platform features</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Everything a smart city needs for road safety
            </h2>
            <p className="mt-4 text-muted-foreground">
              One connected platform for citizens, municipalities and contractors — powered by AI and modern GIS.
            </p>
          </motion.div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
                className="group rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-card-hover"
              >
                <div className={cn("mb-4 flex h-11 w-11 items-center justify-center rounded-xl transition-transform group-hover:scale-110", f.color)}>
                  {f.icon}
                </div>
                <h3 className="text-base font-semibold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">How it works</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              From pothole to repair in three steps
            </h2>
          </motion.div>

          <div className="relative mt-14 grid gap-10 md:grid-cols-3">
            <div className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent md:block" />
            {STEPS.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="relative text-center"
              >
                <div className="relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-glow">
                  {s.icon}
                </div>
                <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-primary">Step {i + 1}</p>
                <h3 className="mt-1.5 text-lg font-semibold text-foreground">{s.title}</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">{s.text}</p>
              </motion.div>
            ))}
          </div>

          {/* Workflow pipeline */}
          <motion.div {...fadeUp} className="mt-16 rounded-2xl border border-border bg-white p-6 sm:p-8">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-semibold text-foreground">Complaint lifecycle</p>
                <p className="text-xs text-muted-foreground">Transparent, auditable, end-to-end</p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600">
                <ShieldCheck className="h-3.5 w-3.5" /> SLA-tracked
              </span>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-2 sm:gap-0">
              {WORKFLOW.map((w, i) => (
                <div key={w.label} className="flex items-center">
                  <div
                    className={cn(
                      "flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-medium",
                      w.state === "done" && "bg-emerald-50 text-emerald-700",
                      w.state === "active" && "bg-primary text-white shadow-glow",
                      w.state === "todo" && "bg-muted text-muted-foreground"
                    )}
                  >
                    {w.icon}
                    {w.label}
                  </div>
                  {i < WORKFLOW.length - 1 && <ArrowRight className="mx-1 h-4 w-4 text-border" />}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="border-y border-border bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Built for everyone</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              One platform, three experiences
            </h2>
          </motion.div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {ROLES.map((r, i) => (
              <motion.div
                key={r.role}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                className="group relative overflow-hidden rounded-2xl border border-border p-6 transition-all hover:-translate-y-1 hover:shadow-card-hover"
              >
                <div className={cn("absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br opacity-10 transition-transform group-hover:scale-125", r.color)} />
                <div className={cn("mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg", r.color)}>
                  {r.icon}
                </div>
                <h3 className="text-lg font-semibold text-foreground">{r.role}</h3>
                <ul className="mt-4 space-y-2.5">
                  {r.points.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      {p}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI showcase */}
      <section id="ai" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-3xl bg-slate-950">
            <div className="grid items-center gap-10 p-8 sm:p-12 lg:grid-cols-2 lg:p-16">
              <motion.div {...fadeUp}>
                <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-medium text-blue-300">
                  <Route className="h-3.5 w-3.5" /> Detection Engine
                </p>
                <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Computer vision built for roads
                </h2>
                <p className="mt-4 max-w-md leading-relaxed text-slate-400">
                  Our YOLOv8 detection pipeline classifies road damage (potholes, cracks, surface distress),
                  scores severity, estimates confidence and generates repair recommendations — fully explainable for
                  municipal review.
                </p>
                <div className="mt-8 grid grid-cols-2 gap-4 max-w-md">
                  {["Pothole detection", "Crack detection", "Surface distress", "Severity scoring", "Confidence estimation", "Repair recommendations"].map((t) => (
                    <div key={t} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200">
                      <Sparkles className="h-3.5 w-3.5 text-amber-400" /> {t}
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">AI Prediction Card</p>
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-400">
                    <Brain className="h-3.5 w-3.5" /> yolov8s-rdd2022-v1
                  </span>
                </div>
                <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row">
                  <div className="relative flex h-28 w-28 shrink-0 items-center justify-center">
                    <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="9" />
                      <motion.circle
                        cx="50" cy="50" r="42" fill="none" stroke="#22c55e" strokeWidth="9" strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 42}
                        initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                        whileInView={{ strokeDashoffset: 2 * Math.PI * 42 * 0.06 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                      />
                    </svg>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">94%</p>
                      <p className="text-[10px] uppercase tracking-wider text-slate-400">Confidence</p>
                    </div>
                  </div>
                  <div className="flex-1 space-y-3">
                    {[
                      { k: "Detected", v: "Pothole", c: "text-amber-400" },
                      { k: "Severity", v: "High", c: "text-orange-400" },
                      { k: "Recommendation", v: "Immediate repair required", c: "text-white" },
                    ].map((row) => (
                      <div key={row.k} className="flex items-center justify-between border-b border-white/10 pb-2">
                        <span className="text-xs text-slate-400">{row.k}</span>
                        <span className={cn("text-sm font-semibold", row.c)}>{row.v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-white py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <motion.div {...fadeUp}>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Ready to make roads safer?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Join the smart city movement. Report damage, track repairs and hold repairs to account — all in one place.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link to="/register">
                <Button size="lg" className="gap-2">
                  Create free account <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline">Try demo login</Button>
              </Link>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">
              Demo credentials: <span className="font-mono text-foreground">citizen@demo.com</span> ·{" "}
              <span className="font-mono text-foreground">admin@demo.com</span> ·{" "}
              <span className="font-mono text-foreground">contractor@demo.com</span> — password{" "}
              <span className="font-mono text-foreground">demo1234</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-slate-950 py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:px-6 lg:flex-row lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <svg viewBox="0 0 64 64" className="h-6 w-6" fill="none">
                <path d="M18 40h28v6a2 2 0 0 1-2 2H20a2 2 0 0 1-2-2v-6Z" fill="#F59E0B" />
                <path d="M16 38c0-8 6-14 14-14h4c8 0 14 6 14 14H16Z" fill="#fff" />
                <circle cx="32" cy="33" r="3.5" fill="#EF4444" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Smart Pothole Reporter</p>
              <p className="text-xs text-slate-400">AI-Based Road Damage Detection & Municipal Management</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
            <a href="#features" className="transition-colors hover:text-white">Features</a>
            <a href="#how" className="transition-colors hover:text-white">How it works</a>
            <a href="#roles" className="transition-colors hover:text-white">Roles</a>
            <Link to="/login" className="transition-colors hover:text-white">Sign in</Link>
          </div>
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Smart Pothole Reporter · Final-year engineering project
          </p>
        </div>
      </footer>
    </div>
  );
}
