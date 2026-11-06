"use client";

import Link from "next/link";
import { UserMenu } from "@/components/layout/UserMenu";
import { Icon } from "@/components/ui/Icon";
import { fleetSummary } from "@/lib/inventory";

interface HeaderProps {
  onOpenSidebar: () => void;
}

export function Header({ onOpenSidebar }: HeaderProps) {
  return (
    <header className="fixed left-0 right-0 top-0 z-30 flex h-14 items-center justify-between gap-3 bg-surface/80 px-space-md shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl lg:left-64 lg:px-space-lg">
      <div className="flex max-w-xl flex-1 items-center gap-space-md">
        <button
          type="button"
          onClick={onOpenSidebar}
          aria-label="Abrir menú"
          className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface lg:hidden"
        >
          <Icon name="menu" className="text-[22px]" />
        </button>
        <div className="flex w-full items-center gap-space-sm rounded-xl bg-surface-container-low px-space-md py-1.5 text-secondary">
          <Icon name="search" className="text-[18px]" />
          <input
            type="search"
            placeholder="Buscar activo, software, CVE o licencia... (⌘K)"
            className="w-full bg-transparent font-body-sm text-body-sm text-on-surface placeholder:text-secondary focus:outline-none"
          />
          <span className="hidden rounded bg-surface-container px-1.5 py-0.5 font-label-mono-xs text-label-mono-xs text-secondary sm:inline">
            ⌘K
          </span>
        </div>
      </div>

      <div className="flex items-center gap-space-sm sm:gap-space-md">
        <div className="hidden items-center gap-1.5 rounded-full bg-surface-container px-space-sm py-1 md:flex">
          <span className="h-2 w-2 rounded-full bg-primary-container" />
          <span className="font-label-mono-xs text-label-mono-xs text-on-surface">
            EMPRESA: {fleetSummary.region}
          </span>
        </div>

        <Link
          href="/notifications"
          aria-label="Ver notificaciones"
          className="relative rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
        >
          <Icon name="notifications" className="text-[20px]" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary-container ring-2 ring-surface" />
        </Link>

        <UserMenu />
      </div>
    </header>
  );
}
