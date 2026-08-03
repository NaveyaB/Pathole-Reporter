import { Outlet, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Brain, MapPin, Radar, ShieldCheck } from "lucide-react";

const FEATURES = [
  {
    icon: <Brain className="h-5 w-5" />,
    title: "AI-Powered Detection",
    text: "YOLOv8 model detects damage type, severity and confidence automatically.",
  },
  {
    icon: <Radar className="h-5 w-5" />,
    title: "Duplicate Prevention",
    text: "Smart geo-matching flags repeat reports before they reach the queue.",
  },
  {
    icon: <MapPin className="h-5 w-5" />,
    title: "Live GIS Tracking",
    text: "Every complaint mapped in real time with district and severity filters.",
  },
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: "End-to-End Workflow",
    text: "From citizen report to verified repair with full transparency.",
  },
];

export const AuthLayout = () => (
  <div className="flex min-h-screen bg-background">
    <div className="relative hidden w-1/2 overflow-hidden bg-slate-950 lg:block">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(37,99,235,0.35),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(16,185,129,0.2),transparent_50%)]" />
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative flex h-full flex-col justify-between p-10">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-glow">
            <svg viewBox="0 0 64 64" className="h-7 w-7" fill="none">
              <path d="M18 40h28v6a2 2 0 0 1-2 2H20a2 2 0 0 1-2-2v-6Z" fill="#F59E0B" />
              <path d="M16 38c0-8 6-14 14-14h4c8 0 14 6 14 14H16Z" fill="#fff" />
              <circle cx="26" cy="33" r="3" fill="#2563EB" />
              <circle cx="38" cy="33" r="3" fill="#2563EB" />
              <circle cx="32" cy="33" r="3.5" fill="#EF4444" />
            </svg>
          </div>
          <div className="leading-tight">
            <p className="text-base font-bold text-white">Smart Pothole Reporter</p>
            <p className="text-xs font-medium text-slate-400">AI-Based Road Damage Management</p>
          </div>
        </Link>

        <div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md text-4xl font-bold leading-tight text-white"
          >
            Keep our roads safe, <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">one report at a time</span>.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 max-w-md text-sm leading-relaxed text-slate-400"
          >
            A smart-city platform connecting citizens, municipalities and contractors for faster, smarter road repair.
          </motion.p>

          <div className="mt-10 grid max-w-lg grid-cols-1 gap-3 sm:grid-cols-2">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.08 }}
                className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-blue-300">
                  {f.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{f.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-400">{f.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-500">© {new Date().getFullYear()} Smart Pothole Reporter · Municipal Smart City Platform</p>
      </div>
    </div>

    <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 lg:hidden">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <svg viewBox="0 0 64 64" className="h-6 w-6" fill="none">
                <path d="M18 40h28v6a2 2 0 0 1-2 2H20a2 2 0 0 1-2-2v-6Z" fill="#F59E0B" />
                <path d="M16 38c0-8 6-14 14-14h4c8 0 14 6 14 14H16Z" fill="#fff" />
                <circle cx="32" cy="33" r="3.5" fill="#EF4444" />
              </svg>
            </div>
            <div className="leading-tight">
              <p className="text-base font-bold text-foreground">Smart Pothole Reporter</p>
              <p className="text-xs text-muted-foreground">AI-Based Road Damage Management</p>
            </div>
          </Link>
        </div>
        <Outlet />
      </div>
    </div>
  </div>
);
