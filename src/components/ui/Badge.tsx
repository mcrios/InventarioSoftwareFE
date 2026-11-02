import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type BadgeTone =
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "maintenance";

const toneClasses: Record<BadgeTone, string> = {
  neutral: "bg-surface-container text-on-surface",
  success: "bg-surface-container text-on-surface",
  warning: "bg-secondary-container text-on-secondary-container",
  danger: "bg-error text-on-error shadow-sm",
  maintenance: "bg-secondary-container text-on-secondary-container",
};

interface BadgeProps {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}

export function Badge({ tone = "neutral", className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-label-mono-xs text-label-mono-xs font-semibold",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
