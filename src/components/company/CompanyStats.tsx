import { StatCard } from "@/components/dashboard/StatCard";
import type { Empresa } from "@/types/api";
import type { FleetStat } from "@/types/asset";

interface CompanyStatsProps {
  empresas: Empresa[];
}

function percentage(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

function isSameMonth(value: string, reference: Date) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return false;

  return (
    date.getFullYear() === reference.getFullYear() &&
    date.getMonth() === reference.getMonth()
  );
}

export function CompanyStats({ empresas }: CompanyStatsProps) {
  const total = empresas.length;
  const activas = empresas.filter((empresa) => empresa.activo).length;
  const inactivas = total - activas;
  const nuevas = empresas.filter((empresa) =>
    isSameMonth(empresa.fechaCreacion, new Date()),
  ).length;

  const stats: FleetStat[] = [
    {
      id: "total",
      label: "Empresas registradas",
      icon: "corporate_fare",
      value: String(total),
      detail: "Base multiempresa",
      progress: 100,
      tone: "neutral",
    },
    {
      id: "activas",
      label: "Empresas activas",
      icon: "verified",
      value: String(activas),
      detail: `${percentage(activas, total)}% del total`,
      progress: percentage(activas, total),
      tone: "primary",
    },
    {
      id: "inactivas",
      label: "Empresas inactivas",
      icon: "pause_circle",
      value: String(inactivas),
      detail: inactivas ? "Requieren revisión" : "Sin pendientes",
      progress: percentage(inactivas, total),
      tone: inactivas ? "danger" : "secondary",
    },
    {
      id: "nuevas",
      label: "Nuevas este mes",
      icon: "domain_add",
      value: String(nuevas),
      detail: "Altas recientes",
      progress: percentage(nuevas, total),
      tone: "secondary",
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
