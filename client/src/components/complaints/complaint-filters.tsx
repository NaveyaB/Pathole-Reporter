import { Search, X } from "lucide-react";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { DISTRICT_NAMES, PRIORITY_OPTIONS, SEVERITY_OPTIONS, STATUS_OPTIONS } from "@/constants";
import { titleCase } from "@/lib/utils";

export interface ComplaintFiltersState {
  search: string;
  status: string;
  district: string;
  priority: string;
  severity: string;
}

interface ComplaintFiltersProps {
  filters: ComplaintFiltersState;
  onChange: (filters: ComplaintFiltersState) => void;
}

const toOptions = (values: string[]) => [
  { value: "", label: "All" },
  ...values.map((v) => ({ value: v, label: titleCase(v) })),
];

export const ComplaintFilters = ({ filters, onChange }: ComplaintFiltersProps) => {
  const set = (key: keyof ComplaintFiltersState, value: string) => onChange({ ...filters, [key]: value });

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 shadow-card lg:flex-row lg:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.search}
          onChange={(e) => set("search", e.target.value)}
          placeholder="Search by report number, title or location…"
          className="pl-9"
        />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:flex">
        <Select value={filters.status} onChange={(v) => set("status", v)} options={toOptions(STATUS_OPTIONS)} placeholder="Status" className="lg:w-36" />
        <Select value={filters.district} onChange={(v) => set("district", v)} options={toOptions(DISTRICT_NAMES)} placeholder="District" className="lg:w-40" />
        <Select value={filters.priority} onChange={(v) => set("priority", v)} options={toOptions(PRIORITY_OPTIONS)} placeholder="Priority" className="lg:w-32" />
        <Select value={filters.severity} onChange={(v) => set("severity", v)} options={toOptions(SEVERITY_OPTIONS)} placeholder="Severity" className="lg:w-32" />
        {(filters.search || filters.status || filters.district || filters.priority || filters.severity) && (
          <button
            onClick={() => onChange({ search: "", status: "", district: "", priority: "", severity: "" })}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" /> Clear
          </button>
        )}
      </div>
    </div>
  );
};
