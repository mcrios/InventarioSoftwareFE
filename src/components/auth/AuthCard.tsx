import type { ReactNode } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="w-full">
      <Link
        href="/login"
        className="mb-8 flex items-center gap-3 lg:hidden"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-container">
          <Icon name="layers" className="text-[20px] text-on-primary" />
        </div>
        <div className="flex flex-col">
          <span className="font-headline-sm text-headline-sm leading-none tracking-tight text-on-surface">
            OpsCore
          </span>
          <span className="mt-0.5 font-label-mono-xs text-label-mono-xs text-secondary">
            ITAM v2.4
          </span>
        </div>
      </Link>

      <div className="mb-7">
        <p className="font-label-mono-xs text-label-mono-xs uppercase tracking-[0.2em] text-primary-container">
          OpsCore // Secure Access
        </p>
        <h1 className="mt-2 font-headline-lg text-headline-lg tracking-tight text-on-surface">
          {title}
        </h1>
        <p className="mt-2 font-body-md text-body-md text-secondary">
          {subtitle}
        </p>
      </div>

      {children}

      {footer ? (
        <div className="mt-6 border-t border-surface-variant pt-5 text-center font-body-sm text-body-sm text-secondary">
          {footer}
        </div>
      ) : null}
    </div>
  );
}
