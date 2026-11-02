import type { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  badge?: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({
  eyebrow,
  title,
  badge,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <header className="mb-6">
      <div className="flex flex-col gap-4 border-b border-surface-variant pb-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded bg-primary-container" />
            <span className="font-label-mono-xs text-label-mono-xs uppercase tracking-widest text-secondary">
              {eyebrow}
            </span>
          </div>
          <div className="flex flex-wrap items-baseline gap-3">
            <h1 className="font-headline-lg text-headline-lg tracking-tight text-on-surface">
              {title}
            </h1>
            {badge ? (
              <span className="rounded-full bg-surface-container px-2.5 py-0.5 font-label-mono-sm text-label-mono-sm font-semibold text-on-surface">
                {badge}
              </span>
            ) : null}
          </div>
          {description ? (
            <p className="max-w-2xl font-body-md text-body-md text-secondary">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex flex-wrap items-center gap-3">{actions}</div>
        ) : null}
      </div>
    </header>
  );
}
