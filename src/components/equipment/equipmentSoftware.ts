import type { BadgeTone } from "@/components/ui/Badge";
import { formatDate } from "@/lib/format";
import type {
  Actualizacion,
  EquipoSoftware,
  Licencia,
} from "@/types/api";

/** Días de anticipación con los que se avisa el vencimiento de una licencia. */
export const LICENSE_EXPIRY_WARNING_DAYS = 30;

/** Software seleccionado para instalar en un equipo. */
export interface SoftwareAssignment {
  softwareId: number;
  licenciaId: number | null;
  versionInstalada: string;
}

function parseVersion(value: string) {
  return value
    .trim()
    .replace(/^v/i, "")
    .split(/[.\-_+ ]/)
    .map((part) => {
      const match = part.match(/^\d+/);
      return match ? Number(match[0]) : 0;
    });
}

/** Compara dos versiones tipo `1.2.3`. Devuelve -1, 0 o 1. */
export function compareVersions(left: string, right: string) {
  const a = parseVersion(left);
  const b = parseVersion(right);
  const length = Math.max(a.length, b.length);

  for (let index = 0; index < length; index += 1) {
    const valueA = a[index] ?? 0;
    const valueB = b[index] ?? 0;

    if (valueA !== valueB) return valueA < valueB ? -1 : 1;
  }

  return 0;
}

/**
 * Última versión publicada por software. Toma las actualizaciones del catálogo
 * y cae en `software.versionActual` cuando todavía no hay ninguna publicada.
 */
export function buildLatestUpdates(actualizaciones: Actualizacion[]) {
  const map = new Map<number, Actualizacion>();

  actualizaciones.forEach((actualizacion) => {
    const softwareId = actualizacion.software?.id;

    if (!softwareId) return;

    const current = map.get(softwareId);

    if (
      !current ||
      compareVersions(actualizacion.versionDestino, current.versionDestino) > 0
    ) {
      map.set(softwareId, actualizacion);
    }
  });

  return map;
}

export function getInstallationTargetVersion(
  instalacion: EquipoSoftware,
  latestUpdates: Map<number, Actualizacion>,
) {
  return (
    latestUpdates.get(instalacion.software.id)?.versionDestino ??
    instalacion.software.versionActual
  );
}

export function isInstallationOutdated(
  instalacion: EquipoSoftware,
  latestUpdates: Map<number, Actualizacion>,
) {
  const installed = instalacion.versionInstalada?.trim();

  if (!installed) return false;

  return (
    compareVersions(
      installed,
      getInstallationTargetVersion(instalacion, latestUpdates),
    ) < 0
  );
}

export function getInstallationLicense(
  instalacion: EquipoSoftware,
): Licencia | null {
  return instalacion.licencia ?? instalacion.software.licencia ?? null;
}

/** Licencias únicas que están siendo usadas por las instalaciones cargadas. */
export function collectLicensesInUse(instalaciones: EquipoSoftware[]) {
  const map = new Map<number, Licencia>();

  instalaciones.forEach((instalacion) => {
    const licencia = getInstallationLicense(instalacion);

    if (licencia) map.set(licencia.id, licencia);
  });

  return Array.from(map.values());
}

export type LicenseExpiryState = "unknown" | "expired" | "soon" | "valid";

export interface LicenseExpiryMeta {
  state: LicenseExpiryState;
  days: number | null;
  label: string;
  tone: BadgeTone;
  icon: string;
}

function parseDateOnly(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (match) {
    return new Date(
      Number(match[1]),
      Number(match[2]) - 1,
      Number(match[3]),
    );
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

export function getLicenseExpiryMeta(
  fechaVencimiento: string | null | undefined,
): LicenseExpiryMeta {
  if (!fechaVencimiento) {
    return {
      state: "unknown",
      days: null,
      label: "Sin fecha de vencimiento",
      tone: "neutral",
      icon: "event_available",
    };
  }

  const target = parseDateOnly(fechaVencimiento);

  if (!target) {
    return {
      state: "unknown",
      days: null,
      label: "Fecha no válida",
      tone: "neutral",
      icon: "event_busy",
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (days < 0) {
    return {
      state: "expired",
      days,
      label: `Vencida hace ${Math.abs(days)} día${Math.abs(days) === 1 ? "" : "s"}`,
      tone: "danger",
      icon: "event_busy",
    };
  }

  if (days <= LICENSE_EXPIRY_WARNING_DAYS) {
    return {
      state: "soon",
      days,
      label:
        days === 0 ? "Vence hoy" : `Vence en ${days} día${days === 1 ? "" : "s"}`,
      tone: "warning",
      icon: "event",
    };
  }

  return {
    state: "valid",
    days,
    label: `Vigente hasta ${formatDate(fechaVencimiento)}`,
    tone: "neutral",
    icon: "event_available",
  };
}
