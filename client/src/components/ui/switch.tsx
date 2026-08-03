import { useState } from "react";
import { cn } from "@/lib/utils";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const Switch = ({ checked, onCheckedChange, disabled, className }: SwitchProps) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={() => onCheckedChange(!checked)}
    className={cn(
      "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus-ring disabled:pointer-events-none disabled:opacity-50",
      checked ? "bg-primary" : "bg-slate-300",
      className
    )}
  >
    <span
      className={cn(
        "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
        checked ? "translate-x-[18px]" : "translate-x-0.5"
      )}
    />
  </button>
);

interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const Checkbox = ({ checked, onCheckedChange, disabled, className }: CheckboxProps) => (
  <button
    type="button"
    role="checkbox"
    aria-checked={checked}
    disabled={disabled}
    onClick={() => onCheckedChange(!checked)}
    className={cn(
      "flex h-4.5 w-4.5 h-[18px] w-[18px] items-center justify-center rounded border transition-colors focus-ring disabled:pointer-events-none disabled:opacity-50",
      checked ? "border-primary bg-primary text-white" : "border-slate-300 bg-white",
      className
    )}
  >
    {checked && (
      <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none">
        <path d="M2 6l2.5 2.5L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )}
  </button>
);
