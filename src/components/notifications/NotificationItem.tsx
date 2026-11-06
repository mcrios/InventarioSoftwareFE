"use client";

import { getNotificationTypeMeta } from "@/components/notifications/notificationMeta";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Notificacion } from "@/types/api";

interface NotificationItemProps {
  notificacion: Notificacion;
  marking: boolean;
  onMarkRead: (notificacion: Notificacion) => void;
  onDelete: (notificacion: Notificacion) => void;
}

const iconToneClasses: Record<string, string> = {
  success: "bg-surface-container text-primary-container",
  warning: "bg-secondary-container text-on-secondary-container",
  danger: "bg-error-container text-error",
  neutral: "bg-surface-container text-on-surface",
  maintenance: "bg-secondary-container text-on-secondary-container",
  dark: "bg-dark text-on-dark",
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "?";
}

export function NotificationItem({
  notificacion,
  marking,
  onMarkRead,
  onDelete,
}: NotificationItemProps) {
  const meta = getNotificationTypeMeta(notificacion.tipo);
  const usuario = notificacion.usuario;
  const empresa = usuario?.empresas?.[0] ?? null;
  const unread = !notificacion.leida;

  return (
    <li
      className={cn(
        "flex flex-col gap-3 px-4 py-4 transition-colors sm:flex-row sm:items-start",
        unread
          ? "bg-primary-container/[0.04] hover:bg-primary-container/[0.07]"
          : "hover:bg-surface-container-low",
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm",
          iconToneClasses[meta.tone] ?? iconToneClasses.neutral,
        )}
      >
        <Icon name={meta.icon} className="text-[21px]" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "font-title-md text-body-md text-on-surface",
              unread && "font-semibold",
            )}
          >
            {notificacion.titulo}
          </span>
          {unread ? (
            <span
              title="Sin leer"
              className="h-2 w-2 shrink-0 rounded-full bg-primary-container"
            />
          ) : null}
          <Badge tone={meta.tone}>{meta.label}</Badge>
        </div>

        <p className="max-w-3xl font-body-sm text-body-sm text-secondary">
          {notificacion.mensaje}
        </p>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-label-mono-xs text-label-mono-xs text-secondary">
          <span className="flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-container-high text-[9px] font-bold text-on-surface">
              {getInitials(usuario?.nombre ?? "?")}
            </span>
            {usuario?.nombre || "Usuario no disponible"}
          </span>
          {empresa ? (
            <span className="flex items-center gap-1">
              <Icon name="corporate_fare" className="text-[13px]" />
              {empresa.nombre}
            </span>
          ) : null}
          <span className="flex items-center gap-1">
            <Icon name="schedule" className="text-[13px]" />
            {formatDateTime(notificacion.fechaCreacion)}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:self-center">
        {unread ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onMarkRead(notificacion)}
            disabled={marking}
            title="Marcar como leída"
          >
            <Icon
              name={marking ? "progress_activity" : "mark_email_read"}
              className={cn("text-[16px]", marking && "animate-spin")}
            />
            <span>{marking ? "Marcando..." : "Marcar leída"}</span>
          </Button>
        ) : (
          <span className="flex items-center gap-1.5 px-2 font-label-mono-xs text-label-mono-xs text-secondary">
            <Icon name="check" className="text-[15px]" />
            Leída
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Eliminar notificación ${notificacion.titulo}`}
          title="Eliminar notificación"
          className="text-error hover:bg-error-container"
          onClick={() => onDelete(notificacion)}
        >
          <Icon name="delete" className="text-[18px]" />
        </Button>
      </div>
    </li>
  );
}
