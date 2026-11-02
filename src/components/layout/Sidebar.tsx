"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { navigation } from "@/lib/navigation";
import { currentUser } from "@/lib/users";
import { cn } from "@/lib/utils";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {open ? (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-on-surface/30 backdrop-blur-sm lg:hidden"
        />
      ) : null}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full w-64 flex-col bg-surface-container-low shadow-[0_1px_8px_rgba(0,0,0,0.04)] transition-transform duration-200 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex h-14 items-center justify-between bg-surface-container-low px-space-md">
            <Link
              href="/dashboard"
              onClick={onClose}
              className="flex items-center gap-space-sm"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-container">
                <Icon
                  name="layers"
                  className="text-[18px] text-on-primary"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm leading-none tracking-tight text-on-surface">
                  CoreInventory
                </span>
                <span className="mt-0.5 font-label-mono-xs text-label-mono-xs text-secondary">
                  Version 0.1
                </span>
              </div>
            </Link>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-primary-container" />
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar menú"
                className="text-on-surface-variant hover:text-on-surface lg:hidden"
              >
                <Icon name="close" className="text-[20px]" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-space-sm pb-space-md">
            {navigation.map((section) => (
              <div key={section.label}>
                <div className="px-space-md pb-space-xs pt-space-md">
                  <span className="font-label-mono-xs text-label-mono-xs uppercase tracking-wider text-secondary">
                    {section.label}
                  </span>
                </div>
                <nav className="flex flex-col gap-1">
                  {section.items.map((item) => {
                    const active =
                      pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-space-sm rounded-xl px-space-md py-2.5 font-title-md text-title-md transition-all",
                          active
                            ? "bg-secondary-container text-on-surface"
                            : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
                        )}
                      >
                        <Icon name={item.icon} className="text-[20px]" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-space-sm bg-surface-container-low p-space-md">
          <div className="flex flex-col gap-1.5 rounded-xl bg-surface-container p-2.5">
            <div className="flex items-center justify-between">
              <span className="font-label-mono-xs text-label-mono-xs uppercase text-secondary">
                Estado
              </span>
              <span className="flex items-center gap-1 font-label-mono-xs text-label-mono-xs text-on-surface">
                <span className="h-1.5 w-1.5 rounded-full bg-primary-container" />
                SYS.SYNCRONIZED: OK
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-surface-container p-2">
            <div className="flex items-center gap-space-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                <Icon
                  name="person"
                  className="text-[18px] text-on-primary"
                  filled
                />
              </div>
              <div className="flex flex-col">
                <span className="font-title-md text-title-md leading-tight text-on-surface">
                  {currentUser.name}
                </span>
                <span className="font-label-mono-xs text-label-mono-xs text-secondary">
                  {currentUser.role}
                </span>
              </div>
            </div>
            <Link
              href="/settings"
              onClick={onClose}
              aria-label="Configuración de la cuenta"
              className="rounded-lg p-1 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
            >
              <Icon name="settings" className="text-[18px]" />
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
