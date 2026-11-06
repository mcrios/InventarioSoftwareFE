import { StatCard } from "@/components/dashboard/StatCard";
import { APPROVAL_STATE, normalizeApprovalState } from "@/lib/approvalService";
import type { FleetStat } from "@/types/asset";
import type { SolicitudActualizacion } from "@/types/api";

interface ApprovalStatsProps {
  solicitudes: SolicitudActualizacion[];
}

function percentage(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

export function ApprovalStats({ solicitudes }: ApprovalStatsProps) {
  const total = solicitudes.length;
  const pendientes = solicitudes.filter(
    (solicitud) =>
      normalizeApprovalState(solicitud.estado) === APPROVAL_STATE.pending,
  ).length;
  const aprobadas = solicitudes.filter(
    (solicitud) =>
      normalizeApprovalState(solicitud.estado) === APPROVAL_STATE.approved,
  ).length;
  const rechazadas = solicitudes.filter(
    (solicitud) =>
      normalizeApprovalState(solicitud.estado) === APPROVAL_STATE.rejected,
  ).length;

  const stats: FleetStat[] = [
    {
      id: "total",
      label: "Solicitudes totales",
      icon: "inbox",
      value: String(total),
      detail: "Historial del workflow",
      progress: 100,
      tone: "neutral",
    },
    {
      id: "pendientes",
      label: "Pendientes de revisión",
      icon: "pending_actions",
      value: String(pendientes),
      detail: pendientes ? "Requieren decisión" : "Bandeja al día",
      progress: percentage(pendientes, total),
      tone: "primary",
    },
    {
      id: "aprobadas",
      label: "Actualizaciones aprobadas",
      icon: "verified",
      value: String(aprobadas),
      detail: `${percentage(aprobadas, total)}% del total`,
      progress: percentage(aprobadas, total),
      tone: "secondary",
    },
    {
      id: "rechazadas",
      label: "Solicitudes rechazadas",
      icon: "block",
      value: String(rechazadas),
      detail: rechazadas ? "Con observaciones" : "Sin rechazos",
      progress: percentage(rechazadas, total),
      tone: rechazadas ? "danger" : "secondary",
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
