import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-9 w-full rounded-lg border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground/70 focus-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[90px] w-full rounded-lg border border-input bg-white px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground/70 focus-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export const Label = ({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={cn("text-sm font-medium leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)} {...props}>
    {children}
  </label>
);
