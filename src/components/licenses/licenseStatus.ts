import type { BadgeTone } from "@/components/ui/Badge";
import { formatDate } from "@/lib/format";
import type { Licencia } from "@/types/api";

export type ExpirationState =
  | "VIGENTE"
  | "POR_VENCER"
  | "VENCIDA"
  | "PERPETUA";

export interface LicenseStatusInfo {
  expirationState: ExpirationState;
  daysRemaining: number | null;
  statusLabel: string;
  badgeTone: BadgeTone;
  formattedDate: string;
  usagePercent: number;
  availableInstallations: number;
  isExhausted: boolean;
}

export function getLicenseStatusInfo(licencia: Licencia): LicenseStatusInfo {
  const total = Math.max(1, licencia.cantidadTotal ?? 1);
  const used = Math.max(0, licencia.cantidadUsada ?? 0);
  const available = Math.max(0, total - used);
  const usagePercent = Math.min(100, Math.round((used / total) * 100));
  const isExhausted = used >= total;

  if (!licencia.fechaVencimiento) {
    return {
      expirationState: "PERPETUA",
      daysRemaining: null,
      statusLabel: "Perpetua (Sin vencimiento)",
      badgeTone: "success",
      formattedDate: "Perpetua",
      usagePercent,
      availableInstallations: available,
      isExhausted,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Parse YYYY-MM-DD
  const [year, month, day] = licencia.fechaVencimiento
    .split("-")
    .map((num) => parseInt(num, 10));

  const expDate = new Date(year, (month || 1) - 1, day || 1);
  expDate.setHours(0, 0, 0, 0);

  const diffTime = expDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const expiredDaysAgo = Math.abs(diffDays);
    return {
      expirationState: "VENCIDA",
      daysRemaining: diffDays,
      statusLabel: `Vencida (hace ${expiredDaysAgo} ${expiredDaysAgo === 1 ? "día" : "días"})`,
      badgeTone: "danger",
      formattedDate: formatDate(licencia.fechaVencimiento),
      usagePercent,
      availableInstallations: available,
      isExhausted,
    };
  }

  if (diffDays <= 30) {
    return {
      expirationState: "POR_VENCER",
      daysRemaining: diffDays,
      statusLabel:
        diffDays === 0
          ? "Vence hoy"
          : `Vence en ${diffDays} ${diffDays === 1 ? "día" : "días"}`,
      badgeTone: "warning",
      formattedDate: formatDate(licencia.fechaVencimiento),
      usagePercent,
      availableInstallations: available,
      isExhausted,
    };
  }

  return {
    expirationState: "VIGENTE",
    daysRemaining: diffDays,
    statusLabel: `Vigente (${diffDays} días)`,
    badgeTone: "success",
    formattedDate: formatDate(licencia.fechaVencimiento),
    usagePercent,
    availableInstallations: available,
    isExhausted,
  };
}

