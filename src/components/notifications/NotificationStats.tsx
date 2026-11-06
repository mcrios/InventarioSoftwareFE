import { StatCard } from "@/components/dashboard/StatCard";
import type { FleetStat } from "@/types/asset";
import type { Notificacion } from "@/types/api";

interface NotificationStatsProps {
  notificaciones: Notificacion[];
}

function percentage(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

function isToday(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return false;

  const today = new Date();

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

export function NotificationStats({
  notificaciones,
}: NotificationStatsProps) {
  const total = notificaciones.length;
  const noLeidas = notificaciones.filter(
    (notificacion) => !notificacion.leida,
  ).length;
  const leidas = total - noLeidas;
  const hoy = notificaciones.filter((notificacion) =>
    isToday(notificacion.fechaCreacion),
  ).length;

  const stats: FleetStat[] = [
    {
      id: "total",
      label: "Notificaciones totales",
      icon: "notifications",
      value: String(total),
      detail: "Historial de avisos",
      progress: 100,
      tone: "neutral",
    },
    {
      id: "no-leidas",
      label: "Sin leer",
      icon: "mark_email_unread",
      value: String(noLeidas),
      detail: noLeidas ? "Requieren atención" : "Bandeja al día",
      progress: percentage(noLeidas, total),
      tone: "primary",
    },
    {
      id: "leidas",
      label: "Leídas",
      icon: "mark_email_read",
      value: String(leidas),
      detail: `${percentage(leidas, total)}% del total`,
      progress: percentage(leidas, total),
      tone: "secondary",
    },
    {
      id: "hoy",
      label: "Recibidas hoy",
      icon: "today",
      value: String(hoy),
      detail: hoy ? "Actividad reciente" : "Sin novedades",
      progress: percentage(hoy, total),
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
