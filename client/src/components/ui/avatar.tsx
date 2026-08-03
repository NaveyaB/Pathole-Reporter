import { initials } from "@/lib/utils";
import { cn } from "@/lib/utils";

const PALETTES = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-indigo-500",
  "bg-cyan-500",
  "bg-fuchsia-500",
  "bg-slate-600",
];

const hashHue = (name: string): number =>
  Array.from(name).reduce((acc, c) => acc + c.charCodeAt(0), 0) % PALETTES.length;

export interface AvatarProps {
  name?: string;
  src?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZES: Record<NonNullable<AvatarProps["size"]>, string> = {
  xs: "h-7 w-7 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

export const Avatar = ({ name = "?", src, size = "md", className }: AvatarProps) => {
  const bg = PALETTES[hashHue(name)];
  if (src) {
    return <img src={src} alt={name} className={cn(SIZES[size], "rounded-full object-cover ring-2 ring-white", className)} />;
  }
  return (
    <div
      className={cn(
        SIZES[size],
        "flex shrink-0 items-center justify-center rounded-full font-semibold text-white",
        bg,
        className
      )}
      aria-label={name}
    >
      {initials(name)}
    </div>
  );
};
