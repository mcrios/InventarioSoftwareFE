import Link from "next/link";
import { ErrorActions } from "@/components/errors/ErrorActions";
import { Icon } from "@/components/ui/Icon";

interface ErrorPageProps {
  code: string;
  title: string;
  description: string;
  icon: string;
  hint?: string;
}

export function ErrorPage({
  code,
  title,
  description,
  icon,
  hint,
}: ErrorPageProps) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface px-4 py-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-16 h-64 w-64 rounded-full bg-primary-container/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-secondary/10 blur-3xl"
      />

      <div className="relative w-full max-w-lg">
        <Link
          href="/dashboard"
          className="mb-8 flex items-center justify-center gap-3"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-container">
            <Icon name="layers" className="text-[20px] text-on-primary" />
          </span>
          <span className="flex flex-col">
            <span className="font-headline-sm text-headline-sm leading-none tracking-tight text-on-surface">
              OpsCore
            </span>
            <span className="mt-0.5 font-label-mono-xs text-label-mono-xs text-secondary">
              ITAM v2.4
            </span>
          </span>
        </Link>

        <div className="rounded-3xl bg-surface-container-lowest p-8 text-center shadow-[0_18px_48px_rgba(26,45,51,0.10)] ring-1 ring-surface-variant sm:p-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container px-3 py-1 font-label-mono-xs text-label-mono-xs uppercase tracking-[0.16em] text-secondary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-container" />
            Error {code}
          </span>

          <div className="mx-auto mt-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-container text-primary-container">
            <Icon name={icon} className="text-[34px]" />
          </div>

          <h1 className="mt-5 font-headline-lg text-headline-lg tracking-tight text-on-surface">
            {title}
          </h1>
          <p className="mt-2 font-body-md text-body-md text-secondary">
            {description}
          </p>

          {hint ? (
            <p className="mt-3 rounded-xl bg-surface-container-low px-3 py-2 font-label-mono-xs text-label-mono-xs text-secondary">
              {hint}
            </p>
          ) : null}

          <ErrorActions />
        </div>

        <p className="mt-6 text-center font-label-mono-xs text-label-mono-xs text-secondary">
          Si el problema persiste, contacta al administrador del sistema.
        </p>
      </div>
    </main>
  );
}
