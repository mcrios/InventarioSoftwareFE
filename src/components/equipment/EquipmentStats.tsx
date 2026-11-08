import {
  buildLatestUpdates,
  collectLicensesInUse,
  getLicenseExpiryMeta,
  isInstallationOutdated,
  LICENSE_EXPIRY_WARNING_DAYS,
} from "@/components/equipment/equipmentSoftware";
import { StatCard } from "@/components/dashboard/StatCard";
import type { FleetStat } from "@/types/asset";
import type {
  Actualizacion,
  Equipo,
  EquipoSoftware,
} from "@/types/api";

interface EquipmentStatsProps {
  equipos: Equipo[];
  instalaciones: EquipoSoftware[];
  actualizaciones: Actualizacion[];
}

function percentage(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

export function EquipmentStats({
  equipos,
  instalaciones,
  actualizaciones,
}: EquipmentStatsProps) {
  const latestUpdates = buildLatestUpdates(actualizaciones);
  const pendientes = instalaciones.filter((instalacion) =>
    isInstallationOutdated(instalacion, latestUpdates),
  );
  const equiposAfectados = new Set(
    pendientes.map((instalacion) => instalacion.equipo.id),
  ).size;

  const licencias = collectLicensesInUse(instalaciones);
  const porVencer = licencias.filter(
    (licencia) =>
      getLicenseExpiryMeta(licencia.fechaVencimiento).state === "soon",
  ).length;
  const vencidas = licencias.filter(
    (licencia) =>
      getLicenseExpiryMeta(licencia.fechaVencimiento).state === "expired",
  ).length;

  const conSoftware = new Set(
    instalaciones.map((instalacion) => instalacion.equipo.id),
  );
  const sinSoftware = equipos.filter(
    (equipo) => !conSoftware.has(equipo.id),
  ).length;

  const stats: FleetStat[] = [
    {
      id: "total",
      label: "Equipos registrados",
      icon: "devices",
      value: String(equipos.length),
      detail: `${licencias.length} licencias en uso`,
      progress: 100,
      tone: "neutral",
    },
    {
      id: "actualizaciones",
      label: "Actualizaciones pendientes",
      icon: "system_update_alt",
      value: String(pendientes.length),
      detail: pendientes.length
        ? `${equiposAfectados} equipo${equiposAfectados === 1 ? "" : "s"} afectado${equiposAfectados === 1 ? "" : "s"}`
        : "Todo actualizado",
      progress: percentage(pendientes.length, instalaciones.length),
      tone: pendientes.length ? "danger" : "secondary",
    },
    {
      id: "licencias",
      label: "Licencias por vencer",
      icon: "event_busy",
      value: String(porVencer + vencidas),
      detail:
        porVencer + vencidas === 0
          ? `Sin vencimientos en ${LICENSE_EXPIRY_WARNING_DAYS} días`
          : `${porVencer} en ${LICENSE_EXPIRY_WARNING_DAYS} días${
              vencidas ? ` · ${vencidas} vencida${vencidas === 1 ? "" : "s"}` : ""
            }`,
      progress: percentage(porVencer + vencidas, licencias.length),
      tone: porVencer + vencidas ? "danger" : "secondary",
    },
    {
      id: "sin-software",
      label: "Equipos sin software",
      icon: "devices_other",
      value: String(sinSoftware),
      detail: sinSoftware
        ? "Requieren ficha técnica"
        : "Todos con software",
      progress: percentage(sinSoftware, equipos.length),
      tone: sinSoftware ? "primary" : "secondary",
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.id} stat={stat} />
      ))}
    </div>
  );
}
