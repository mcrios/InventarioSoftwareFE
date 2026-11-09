"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import type { Equipo } from "@/types/api";

interface ManufacturerChartProps {
  equipos: Equipo[];
}

const PALETTE = [
  { stroke: "text-on-surface", dot: "bg-on-surface" },
  { stroke: "text-primary-container", dot: "bg-primary-container" },
  { stroke: "text-secondary", dot: "bg-secondary" },
  { stroke: "text-tertiary-container", dot: "bg-tertiary-container" },
  { stroke: "text-error", dot: "bg-error" },
  { stroke: "text-surface-dim", dot: "bg-surface-dim" },
];

interface ManufacturerGroup {
  id: string;
  name: string;
  count: number;
  percentage: number;
  offset: number;
  color: string;
  dot: string;
}

export function ManufacturerChart({ equipos }: ManufacturerChartProps) {
  const total = equipos.length;

  const groups = useMemo<ManufacturerGroup[]>(() => {
    const map = new Map<string, { name: string; count: number }>();

    equipos.forEach((equipo) => {
      const name = equipo.fabricante?.trim() || "Sin fabricante";
      const key = name.toLocaleLowerCase("es");
      const current = map.get(key);

      if (current) {
        current.count += 1;
      } else {
        map.set(key, { name, count: 1 });
      }
    });

    const sorted = Array.from(map.values()).sort((a, b) => b.count - a.count);
    const top = sorted.slice(0, 5);
    const rest = sorted.slice(5);

    if (rest.length) {
      top.push({
        name: "Otros",
        count: rest.reduce((accumulator, item) => accumulator + item.count, 0),
      });
    }

    const raw = top.map((item, index) => {
      const palette = PALETTE[index % PALETTE.length];

      return {
        id: `${index}-${item.name}`,
        name: item.name,
        count: item.count,
        percentage: total ? (item.count / total) * 100 : 0,
        color: palette.stroke,
        dot: palette.dot,
      };
    });

    return raw.map((group, index) => ({
      ...group,
      offset: raw
        .slice(0, index)
        .reduce((accumulator, item) => accumulator + item.percentage, 0),
    }));
  }, [equipos, total]);

  const identified = useMemo(
    () =>
      new Set(
        equipos
          .map((equipo) => equipo.fabricante?.trim().toLocaleLowerCase("es"))
          .filter(Boolean),
      ).size,
    [equipos],
  );

  const segments = groups.filter((group) => group.count > 0);

  return (
    <Card className="flex flex-col justify-between p-5 xl:col-span-5">
      <div className="flex items-center justify-between gap-2 pb-3">
        <div className="flex items-center gap-2">
          <Icon name="pie_chart" className="text-[20px] text-secondary" />
          <h2 className="font-headline-sm text-headline-sm text-on-surface">
            Distribución por Fabricante
          </h2>
        </div>
        <span className="rounded-full bg-surface-container px-2.5 py-0.5 font-label-mono-xs text-label-mono-xs text-secondary">
          {total} equipo{total === 1 ? "" : "s"}
        </span>
      </div>

      {total === 0 ? (
        <div className="my-2 flex flex-col items-center gap-2 rounded-xl border border-dashed border-surface-variant px-4 py-8 text-center">
          <Icon name="inventory_2" className="text-[26px] text-secondary" />
          <span className="font-title-md text-body-sm text-on-surface">
            Sin equipos registrados
          </span>
          <span className="max-w-xs font-body-sm text-body-sm text-secondary">
            El inventario aún no tiene equipos para agrupar por fabricante.
          </span>
        </div>
      ) : (
        <div className="my-2 flex flex-col items-center gap-6 sm:flex-row">
          <div className="relative h-28 w-28 flex-shrink-0">
            <svg
              viewBox="0 0 36 36"
              className="h-28 w-28 -rotate-90"
              role="img"
              aria-label="Distribución de equipos por fabricante"
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
              <span className="font-headline-sm text-headline-sm text-on-surface">
                {identified}
              </span>
              <span className="font-label-mono-xs text-label-mono-xs uppercase tracking-wider text-secondary">
                Fabricantes
              </span>
            </div>
          </div>

          <div className="flex w-full flex-1 flex-col gap-2">
            {groups.map((group) => (
              <div
                key={group.id}
                className="flex items-center justify-between gap-2 font-title-md text-body-sm"
              >
                <span className="flex min-w-0 items-center gap-1.5 text-on-surface">
                  <span
                    className={cn(
                      "h-2.5 w-2.5 flex-shrink-0 rounded-sm",
                      group.dot,
                    )}
                  />
                  <span className="truncate">{group.name}</span>
                </span>
                <span className="whitespace-nowrap font-code-md text-code-md text-secondary">
                  {group.count} · {Math.round(group.percentage)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-3">
        <span className="font-label-mono-xs text-label-mono-xs text-secondary">
          {identified} fabricante{identified === 1 ? "" : "s"} identificado
          {identified === 1 ? "" : "s"} en {total} equipo
          {total === 1 ? "" : "s"}
        </span>
        <Icon name="verified" className="text-[18px] text-secondary" />
      </div>
    </Card>
  );
}
