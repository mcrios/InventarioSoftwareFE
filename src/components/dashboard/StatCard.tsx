import { Icon } from "@/components/ui/Icon";
import type { FleetStat } from "@/types/asset";
import { cn } from "@/lib/utils";

interface StatCardProps {
  stat: FleetStat;
}

const toneStyles = {
  neutral: {
    card: "bg-surface-container-low",
    label: "text-secondary",
    icon: "text-secondary",
    value: "text-on-surface",
    detail: "text-secondary",
    track: "bg-surface-container",
    bar: "bg-on-surface",
  },
  primary: {
    card: "bg-surface-container-low",
    label: "text-secondary",
    icon: "text-secondary",
    value: "text-on-surface",
    detail: "text-secondary",
    track: "bg-surface-container",
    bar: "bg-primary-container",
  },
  secondary: {
    card: "bg-surface-container-low",
    label: "text-secondary",
    icon: "text-secondary",
    value: "text-on-surface",
    detail: "text-secondary",
    track: "bg-surface-container",
    bar: "bg-secondary",
  },
  danger: {
    card: "bg-error-container text-on-error-container",
    label: "text-on-error-container",
    icon: "text-on-error-container",
    value: "text-on-error-container",
    detail: "bg-error text-on-error",
    track: "bg-surface-container-lowest/50",
    bar: "bg-error",
  },
  warning: {
    card: "bg-warning-container text-on-warning-container",
    label: "text-on-warning-container",
    icon: "text-on-warning-container",
    value: "text-on-warning-container",
    detail: "bg-warning text-on-warning",
    track: "bg-surface-container-lowest/30",
    bar: "bg-warning",
}
} as const;
export function StatCard({ stat }: StatCardProps) {
  const tone = toneStyles[stat.tone];

  return (
    <div
      className={cn(
        "flex flex-col justify-between rounded-xl p-4 shadow-sm",
        tone.card,
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <span
          className={cn(
            "font-label-mono-xs text-label-mono-xs uppercase tracking-wider",
            tone.label,
            stat.tone === "danger" && "font-semibold",
          )}
        >
          {stat.label}
        </span>
        <Icon name={stat.icon} className={cn("text-[18px]", tone.icon)} />
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <span className={cn("font-headline-md text-headline-md", tone.value)}>
          {stat.value}
        </span>
        <span
          className={cn(
            "font-label-mono-xs text-label-mono-xs",
            stat.tone === "danger"
              ? "rounded-full px-2 py-0.5 font-medium"
              : tone.detail,
            stat.tone === "danger" && tone.detail,
          )}
        >
          {stat.detail}
        </span>
      </div>
      <div
        className={cn(
          "mt-3 h-1.5 w-full overflow-hidden rounded-full",
          tone.track,
        )}
      >
        <div
          className={cn("h-full rounded-full", tone.bar)}
          style={{ width: `${stat.progress}%` }}
        />
      </div>
    </div>
  );
}
