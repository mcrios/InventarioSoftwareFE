import type { BadgeTone } from "@/components/ui/Badge";
import type { Notificacion } from "@/types/api";

export interface NotificationTypeMeta {
  label: string;
  tone: BadgeTone;
  icon: string;
}

const typeMeta: Record<string, NotificationTypeMeta> = {
  ACTUALIZACION_APROBADA: {
    label: "Actualización aprobada",
    tone: "success",
    icon: "system_update_alt",
  },
  ACTUALIZACION_RECHAZADA: {
    label: "Actualización rechazada",
    tone: "danger",
    icon: "block",
  },
  SOLICITUD_APROBACION: {
    label: "Solicitud de aprobación",
    tone: "warning",
    icon: "verified_user",
  },
  MANTENIMIENTO: {
    label: "Mantenimiento",
    tone: "neutral",
    icon: "build",
  },
};

export function getNotificationTypeMeta(tipo: string): NotificationTypeMeta {
  return (
    typeMeta[tipo] ?? {
      label: tipo || "General",
      tone: "neutral",
      icon: "notifications",
    }
  );
}

export function getNotificationCompany(notificacion: Notificacion) {
  return notificacion.usuario?.empresas?.[0] ?? null;
}
