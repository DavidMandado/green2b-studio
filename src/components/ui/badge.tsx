import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type BadgeVariant = "neutral" | "success" | "warning" | "danger" | "info";

const badgeStyles: Record<BadgeVariant, string> = {
  neutral: "bg-[var(--card-strong)] text-[var(--foreground)]",
  success: "bg-[var(--accent-soft)] text-[var(--accent-strong)]",
  warning: "bg-[#faedcf] text-[#8f5a13]",
  danger: "bg-[#f6dede] text-[#8d3131]",
  info: "bg-[#ddeaf6] text-[#245a7a]",
};

export function Badge({
  className,
  variant = "neutral",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide",
        badgeStyles[variant],
        className,
      )}
      {...props}
    />
  );
}
