"use client";

import { useMemo } from "react";
import { getEquipmentHealthMeta } from "@/components/equipment/equipmentMeta";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import type { Equipo } from "@/types/api";

interface EquipmentStatusChartProps {
  equipos: Equipo[];
}

const STATUS_GROUPS = [
  {
    id: "success",
    label: "Operativos",
    description: "Sin incidencias",
    color: "text-primary",
    bar: "bg-primary",
    icon: "check_circle",
  },
  {
    id: "warning",
    label: "En observación",
    description: "Requieren seguimiento",
    color: "text-primary-container",
    bar: "bg-primary-container",
    icon: "warning",
  },
  {
    id: "danger",
    label: "Críticos",
    description: "Atención inmediata",
    color: "text-error",
    bar: "bg-error",
    icon: "error",
  },
  {
    id: "neutral",
    label: "Sin estado",
    description: "Salud no registrada",
    color: "text-tertiary",
    bar: "bg-tertiary",
    icon: "monitor_heart",
  },
] as const;

type StatusId = (typeof STATUS_GROUPS)[number]["id"];

export function EquipmentStatusChart({ equipos }: EquipmentStatusChartProps) {
  const total = equipos.length;

  const groups = useMemo(() => {
    const counts: Record<StatusId, number> = {
      success: 0,
      warning: 0,
      danger: 0,
      neutral: 0,
    };

    equipos.forEach((equipo) => {
      const tone = getEquipmentHealthMeta(equipo.salud).tone;

      if (tone === "success" || tone === "warning" || tone === "danger") {
        counts[tone] += 1;
      } else {
        counts.neutral += 1;
      }
    });

    const raw = STATUS_GROUPS.map((group) => {
      const count = counts[group.id];

      return {
        ...group,
        count,
        percentage: total ? (count / total) * 100 : 0,
      };
    });

    return raw.map((group, index) => ({
      ...group,
      offset: raw
        .slice(0, index)
        .reduce((accumulator, item) => accumulator + item.percentage, 0),
    }));
  }, [equipos, total]);

  const segments = groups.filter((group) => group.count > 0);

  return (
    <Card className="mb-6 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3 pb-4">
        <div className="flex items-start gap-2.5">
          <Icon
            name="monitor_heart"
            className="mt-0.5 text-[21px] text-primary-container"
          />
          <div className="flex flex-col">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">
              Estado de los equipos
            </h2>
            <p className="font-body-sm text-body-sm text-secondary">
              Distribución de la flota según la salud registrada en el
              inventario.
            </p>
          </div>
        </div>

        <span className="rounded-full bg-surface-container px-3 py-1 font-label-mono-xs text-label-mono-xs text-secondary">
          {total} equipo{total === 1 ? "" : "s"}
        </span>
      </div>

      {total === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-surface-variant px-4 py-10 text-center">
          <Icon name="monitor_heart" className="text-[28px] text-secondary" />
          <span className="font-title-md text-body-sm text-on-surface">
            Sin equipos registrados
          </span>
          <span className="max-w-md font-body-sm text-body-sm text-secondary">
            Da de alta equipos en el inventario para visualizar la distribución
            de su estado de salud.
          </span>
        </div>
      ) : (
        <div className="grid items-center gap-6 lg:grid-cols-[190px_1fr]">
          <div className="relative mx-auto h-40 w-40">
            <svg
              viewBox="0 0 36 36"
              className="h-40 w-40 -rotate-90"
              role="img"
              aria-label="Distribución de equipos por estado de salud"
            >
              <circle
                cx="18"
                cy="18"
                r="15.9155"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
                className="text-surface-container"
              />

              {segments.map((group) => {
                const dash =
                  segments.length > 1
                    ? Math.max(group.percentage - 0.8, 0)
                    : group.percentage;

                return (
                  <circle
                    key={group.id}
                    cx="18"
                    cy="18"
                    r="15.9155"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    pathLength={100}
                    strokeDasharray={`${dash} ${100 - dash}`}
                    strokeDashoffset={-group.offset}
                    className={group.color}
                  />
                );
              })}
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-headline-md text-headline-md text-on-surface">
                {total}
              </span>
              <span className="font-label-mono-xs text-label-mono-xs uppercase tracking-wider text-secondary">
                Equipos
              </span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {groups.map((group) => (
              <div
                key={group.id}
                className="flex flex-col gap-2 rounded-xl bg-surface-container-lowest p-3 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 font-title-md text-body-sm text-on-surface">
                    <Icon
                      name={group.icon}
                      className={cn("text-[17px]", group.color)}
                    />
                    {group.label}
                  </span>
                  <span className="font-code-md text-code-md text-on-surface">
                    {group.count}
                  </span>
                </div>

                <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container">
                  <div
                    className={cn("h-full rounded-full", group.bar)}
                    style={{ width: `${group.percentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="font-label-mono-xs text-label-mono-xs text-secondary">
                    {group.description}
                  </span>
                  <span className="font-label-mono-xs text-label-mono-xs text-secondary">
                    {Math.round(group.percentage)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
