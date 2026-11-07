import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { formatDate, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Usuario } from "@/types/api";

interface ProfileSummaryProps {
  usuario: Usuario;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "?";
}

function DetailRow({
  icon,
  label,
  children,
}: {
  icon: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-container text-secondary">
        <Icon name={icon} className="text-[17px]" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="font-label-mono-xs text-label-mono-xs uppercase tracking-wider text-secondary">
          {label}
        </span>
        <div className="font-body-sm text-body-sm text-on-surface">
          {children}
        </div>
      </div>
    </div>
  );
}

export function ProfileSummary({ usuario }: ProfileSummaryProps) {
  const roles = usuario.roles ?? [];
  const empresas = usuario.empresas ?? [];

  return (
    <Card className="overflow-hidden">
      <div className="relative overflow-hidden bg-dark px-5 py-6 text-on-dark">
        <span className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full border border-on-dark/10" />
        <span className="pointer-events-none absolute -bottom-20 -right-2 h-44 w-44 rounded-full border border-on-dark/10" />
        <span className="pointer-events-none absolute -bottom-10 right-16 h-24 w-24 rounded-full border border-on-dark/5" />

        <div className="relative flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary-container font-headline-sm text-headline-sm font-semibold text-on-primary shadow-[0_8px_24px_rgba(217,69,0,0.35)]">
            {getInitials(usuario.nombre)}
          </div>
          <div className="flex min-w-0 flex-col">
            <h2 className="truncate font-headline-sm text-headline-sm text-on-dark">
              {usuario.nombre}
            </h2>
            <span className="mt-0.5 truncate font-body-sm text-body-sm text-on-dark/70">
              {usuario.email}
            </span>
            <span
              className={cn(
                "mt-2 inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 font-label-mono-xs text-label-mono-xs font-semibold",
                usuario.activo
                  ? "bg-on-dark/10 text-on-dark"
                  : "bg-error text-on-error",
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  usuario.activo ? "bg-primary-container" : "bg-current",
                )}
              />
              {usuario.activo ? "Cuenta activa" : "Cuenta inactiva"}
            </span>
          </div>
        </div>
      </div>

      <div className="divide-y divide-surface-container px-5 py-2">
        <DetailRow icon="badge" label="Rol principal">
          {roles[0]?.nombre || "Sin rol asignado"}
        </DetailRow>

        <DetailRow icon="corporate_fare" label="Empresas">
          {empresas.length ? (
            <div className="flex flex-wrap gap-1.5">
              {empresas.map((empresa) => (
                <span
                  key={empresa.id}
                  className="rounded bg-surface-container px-2 py-0.5 font-label-mono-xs text-label-mono-xs text-on-surface"
                >
                  {empresa.nombre}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-secondary">Sin empresa asignada</span>
          )}
        </DetailRow>

        <DetailRow icon="schedule" label="Último acceso">
          {formatDateTime(usuario.ultimoAcceso)}
        </DetailRow>

        <DetailRow icon="calendar_month" label="Miembro desde">
          {formatDate(usuario.fechaCreacion)}
        </DetailRow>

        <DetailRow icon="fingerprint" label="Identificador">
          <span className="font-code-md text-code-md">#{usuario.id}</span>
        </DetailRow>
      </div>

      <div className="flex items-start gap-2 bg-surface-container-low px-5 py-3">
        <Icon name="lock" className="mt-0.5 text-[16px] text-secondary" />
        <span className="font-body-sm text-body-sm text-secondary">
          Tus roles y empresas son administrados por el equipo de seguridad.
        </span>
      </div>
    </Card>
  );
}
