import { StatCard } from "@/components/dashboard/StatCard";
import { getLicenseStatusInfo } from "@/components/licenses/licenseStatus";
import type { Licencia } from "@/types/api";
import type { FleetStat } from "@/types/asset";

interface LicenseStatsProps {
  licencias: Licencia[];
}

export function LicenseStats({ licencias }: LicenseStatsProps) {
  const total = licencias.length;

  const totalCapacidad = licencias.reduce(
    (acc, lic) => acc + (lic.cantidadTotal ?? 0),
    0,
  );
  const totalUsadas = licencias.reduce(
    (acc, lic) => acc + (lic.cantidadUsada ?? 0),
    0,
  );
  const porcentajeUso = totalCapacidad
    ? Math.round((totalUsadas / totalCapacidad) * 100)
    : 0;

  const statusInfos = licencias.map(getLicenseStatusInfo);

  const porVencer = statusInfos.filter(
    (info) => info.expirationState === "POR_VENCER",
  ).length;

  const vencidas = statusInfos.filter(
    (info) => info.expirationState === "VENCIDA",
  ).length;

  const agotadas = statusInfos.filter(
    (info) => info.isExhausted,
  ).length;

  const stats: FleetStat[] = [
    {
      id: "total",
      label: "Total de licencias",
      icon: "key",
      value: String(total),
      detail: `${licencias.length} registros en el sistema`,
      progress: 100,
      tone: "neutral",
    },
    {
      id: "capacidad",
      label: "Instalaciones en uso",
      icon: "devices",
      value: `${totalUsadas} / ${totalCapacidad}`,
      detail: `${porcentajeUso}% de instalaciones utilizadas`,
      progress: porcentajeUso,
      tone: porcentajeUso > 90 ? "danger" : "primary",
    },
    {
      id: "por-vencer",
      label: "Próximas a vencer",
      icon: "event_upcoming",
      value: String(porVencer),
      detail: porVencer > 0 ? "En los próximos 30 días" : "Al día",
      progress: total ? Math.round((porVencer / total) * 100) : 0,
      tone: porVencer > 0 ? "warning" : "secondary",
    },
    {
      id: "vencidas-agotadas",
      label: "Vencidas o agotadas",
      icon: "warning",
      value: String(vencidas + agotadas),
      detail:
        vencidas > 0
          ? `${vencidas} vencidas, ${agotadas} agotadas`
          : agotadas > 0
            ? `${agotadas} sin cupos disponibles`
            : "Todas vigentes y con cupo",
      progress: total ? Math.round(((vencidas + agotadas) / total) * 100) : 0,
      tone: vencidas > 0 ? "danger" : agotadas > 0 ? "warning" : "secondary",
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

