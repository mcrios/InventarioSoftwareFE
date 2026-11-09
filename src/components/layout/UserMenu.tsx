"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { authService } from "@/lib/authService";
import { useSessionUser } from "@/hooks/useSessionUser";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    label: "Configuración de la cuenta",
    description: "Perfil y preferencias",
    href: "/settings",
    icon: "settings",
  },
  {
    label: "Gestión de usuarios",
    description: "Equipo y permisos",
    href: "/users",
    icon: "group",
  },
  {
    label: "Centro de notificaciones",
    description: "Avisos y actividad del sistema",
    href: "/notifications",
    icon: "notifications",
    indicator: true,
  },
];

export function UserMenu() {
  const router = useRouter();
  const sessionUser = useSessionUser();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function handleLogout() {
    setOpen(false);
    authService.logout();
    router.replace("/login");
    router.refresh();
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Abrir menú de usuario"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="user-menu"
        className={cn(
          "flex items-center gap-1 rounded-full p-0.5 pr-1 transition-colors hover:bg-surface-container",
          open && "bg-surface-container",
        )}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-label-mono-sm text-label-mono-sm text-on-primary">
          {sessionUser.initials}
        </span>
        <Icon
          name="expand_more"
          className={cn(
            "hidden text-[18px] text-on-surface-variant transition-transform sm:inline",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <div
          id="user-menu"
          role="menu"
          aria-label="Menú de usuario"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-72 overflow-hidden rounded-2xl bg-surface-container-lowest shadow-[0_12px_36px_rgba(0,0,0,0.14)] ring-1 ring-surface-variant"
        >
          <div className="flex items-center gap-3 bg-surface-container-low px-space-md py-space-sm">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary font-label-mono-sm text-label-mono-sm text-on-primary">
              {sessionUser.initials}
            </span>
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-title-md text-title-md leading-tight text-on-surface">
                {sessionUser.fullName}
              </span>
              <span className="font-label-mono-xs text-label-mono-xs uppercase text-secondary">
                {sessionUser.role}
              </span>
            </div>
            <span
              title="Sesión activa"
              className="ml-auto flex items-center gap-1 font-label-mono-xs text-label-mono-xs text-secondary"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary-container" />
              En línea
            </span>
          </div>

          <div className="flex flex-col gap-0.5 p-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-space-sm py-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
              >
                <Icon name={item.icon} className="text-[20px]" />
                <span className="flex min-w-0 flex-col">
                  <span className="font-title-md text-body-sm">
                    {item.label}
                  </span>
                  <span className="font-body-sm text-body-sm text-secondary">
                    {item.description}
                  </span>
                </span>
                {item.indicator ? (
                  <span className="ml-auto h-2 w-2 shrink-0 rounded-full bg-primary-container" />
                ) : null}
              </Link>
            ))}
          </div>

          <div className="border-t border-surface-variant p-2">
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-space-sm py-2 text-error transition-colors hover:bg-error-container"
            >
              <Icon name="logout" className="text-[20px]" />
              <span className="font-title-md text-body-sm">Cerrar sesión</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
