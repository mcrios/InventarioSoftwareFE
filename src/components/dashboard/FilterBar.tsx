"use client";

import { categoryCounts, categoryFilters, categoryLabels } from "@/lib/inventory";
import type { AssetCategory } from "@/types/asset";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";

interface FilterBarProps {
  query: string;
  onQueryChange: (value: string) => void;
  category: AssetCategory | "all";
  onCategoryChange: (category: AssetCategory | "all") => void;
  onReset: () => void;
}

export function FilterBar({
  query,
  onQueryChange,
  category,
  onCategoryChange,
  onReset,
}: FilterBarProps) {
  return (
    <div className="mb-5 flex flex-col gap-3 rounded-2xl bg-surface-container-low p-4 shadow-sm">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-xl bg-surface-container-lowest px-4 py-2 shadow-sm">
          <Icon name="search" className="text-[20px] text-secondary" />
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Buscar por hostname, IP, serial, MAC, kernel o usuario asignado..."
            className="w-full bg-transparent font-body-md text-body-md text-on-surface placeholder:text-secondary focus:outline-none"
          />
          <span className="hidden rounded bg-surface-container px-2 py-0.5 font-label-mono-xs text-label-mono-xs text-secondary sm:inline">
            FILTRO ACTIVO
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1 rounded-xl bg-surface-container p-1 shadow-sm">
          {categoryFilters.map((filter) => {
            const active = category === filter;

            return (
              <button
                key={filter}
                type="button"
                onClick={() => onCategoryChange(filter)}
                className={cn(
                  "rounded-lg px-3 py-1.5 font-title-md text-body-sm transition-all",
                  active
                    ? "bg-surface-container-lowest text-on-surface shadow-sm"
                    : "text-secondary hover:bg-surface-container-highest hover:text-on-surface",
                )}
              >
                {categoryLabels[filter]}
                <span className="ml-1 font-label-mono-xs text-label-mono-xs text-secondary">
                  {categoryCounts[filter]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-surface-variant pt-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-label-mono-xs text-label-mono-xs uppercase tracking-wider text-secondary">
            Criterios:
          </span>
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg bg-surface-container px-3 py-1.5 font-title-md text-body-sm text-on-surface shadow-sm transition-colors hover:bg-surface-container-high"
          >
            <Icon name="location_on" className="text-[16px] text-secondary" />
            <span>
              Ubicación: <strong>Todas (Datacenter &amp; Remoto)</strong>
            </span>
            <Icon name="expand_more" className="text-[16px]" />
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg bg-surface-container px-3 py-1.5 font-title-md text-body-sm text-on-surface shadow-sm transition-colors hover:bg-surface-container-high"
          >
            <Icon
              name="shield_with_heart"
              className="text-[16px] text-secondary"
            />
            <span>
              Estado: <strong>Operativo, Riesgo, Mant.</strong>
            </span>
            <Icon name="expand_more" className="text-[16px]" />
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg bg-surface-container px-3 py-1.5 font-title-md text-body-sm text-on-surface shadow-sm transition-colors hover:bg-surface-container-high"
          >
            <Icon name="terminal" className="text-[16px] text-secondary" />
            <span>
              Sistema Operativo: <strong>Todos</strong>
            </span>
            <Icon name="expand_more" className="text-[16px]" />
          </button>
          <button
            type="button"
            onClick={onReset}
            className="rounded-lg px-2.5 py-1.5 font-label-mono-xs text-label-mono-xs text-secondary transition-colors hover:bg-surface-container hover:text-on-surface"
          >
            Restablecer
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-label-mono-xs text-label-mono-xs text-secondary">
            Vista:
          </span>
          <button
            type="button"
            aria-label="Vista de tabla"
            className="rounded-lg bg-surface-container-lowest p-1.5 text-on-surface shadow-sm"
          >
            <Icon name="table_rows" className="text-[18px]" />
          </button>
          <button
            type="button"
            aria-label="Vista de cuadrícula"
            className="rounded-lg p-1.5 text-secondary transition-colors hover:bg-surface-container hover:text-on-surface"
          >
            <Icon name="grid_view" className="text-[18px]" />
          </button>
        </div>
      </div>
    </div>
  );
}
