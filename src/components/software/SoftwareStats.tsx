import { StatCard } from "@/components/dashboard/StatCard";
import {
  buildLatestUpdates,
  isInstallationOutdated,
} from "@/components/equipment/equipmentSoftware";
import { isPendingApproval } from "@/lib/approvalService";
import type { FleetStat } from "@/types/asset";
import type {
  Actualizacion,
  EquipoSoftware,
  Software,
  SolicitudActualizacion,
} from "@/types/api";

interface SoftwareStatsProps {
  software: Software[];
  actualizaciones: Actualizacion[];
  instalaciones: EquipoSoftware[];
  solicitudes: SolicitudActualizacion[];
}

function percentage(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

export function SoftwareStats({
  software,
  actualizaciones,
  instalaciones,
  solicitudes,
}: SoftwareStatsProps) {
  const latestUpdates = buildLatestUpdates(actualizaciones);
  const equiposDesactualizados = new Set(
    instalaciones
      .filter((instalacion) =>
        isInstallationOutdated(instalacion, latestUpdates),
      )
      .map((instalacion) => instalacion.equipo.id),
  ).size;

  const empresas = new Set(
    software.map((item) => item.licencia.empresa.id),
  ).size;
  const pendientes = solicitudes.filter(isPendingApproval).length;
  const conActualizacion = new Set(
    actualizaciones.map((actualizacion) => actualizacion.software.id),
  ).size;

  const stats: FleetStat[] = [
    {
      id: "software",
      label: "Software registrado",
      icon: "apps",
      value: String(software.length),
      detail: `${empresas} empresa${empresas === 1 ? "" : "s"} con licencia`,
      progress: 100,
      tone: "neutral",
    },
    {
      id: "actualizaciones",
      label: "Actualizaciones publicadas",
      icon: "system_update_alt",
      value: String(actualizaciones.length),
      detail: `${conActualizacion} software con parches`,
      progress: percentage(conActualizacion, software.length),
      tone: "primary",
    },
    {
      id: "equipos",
      label: "Equipos desactualizados",
      icon: "devices_other",
      value: String(equiposDesactualizados),
      detail: equiposDesactualizados
        ? "Requieren despliegue"
        : "Flota al día",
      progress: percentage(
        equiposDesactualizados,
        new Set(instalaciones.map((item) => item.equipo.id)).size,
      ),
      tone: equiposDesactualizados ? "danger" : "secondary",
    },
    {
      id: "solicitudes",
      label: "Solicitudes pendientes",
      icon: "rocket_launch",
      value: String(pendientes),
      detail: pendientes ? "En bandeja de aprobación" : "Sin solicitudes pendientes",
      progress: percentage(pendientes, solicitudes.length),
      tone: pendientes ? "danger" : "secondary",
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
