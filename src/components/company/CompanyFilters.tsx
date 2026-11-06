"use client";

import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

export type CompanyStatusFilter = "all" | "active" | "inactive";

interface CompanyFiltersProps {
  query: string;
  onQueryChange: (value: string) => void;
  status: CompanyStatusFilter;
  onStatusChange: (status: CompanyStatusFilter) => void;
  counts: Record<CompanyStatusFilter, number>;
  onReset: () => void;
}

const filters: Array<{ key: CompanyStatusFilter; label: string }> = [
  { key: "all", label: "Todas" },
  { key: "active", label: "Activas" },
  { key: "inactive", label: "Inactivas" },
];

export function CompanyFilters({
  query,
  onQueryChange,
  status,
  onStatusChange,
  counts,
  onReset,
}: CompanyFiltersProps) {
  return (
    <div className="mb-5 flex flex-col gap-3 rounded-2xl bg-surface-container-low p-4 shadow-sm">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-xl bg-surface-container-lowest px-4 py-2 shadow-sm">
          <Icon name="search" className="text-[20px] text-secondary" />
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Buscar por nombre, identificador o estado..."
            className="w-full bg-transparent font-body-md text-body-md text-on-surface placeholder:text-secondary focus:outline-none"
          />
          <span className="hidden rounded bg-secondary px-2 py-0.5 font-label-mono-xs text-center text-label-mono-xs text-white sm:inline"
            onClick={onReset}
          >
            Lipiar Filtros
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1 rounded-xl bg-surface-container p-1 shadow-sm">
          {filters.map((filter) => {
            const active = status === filter.key;

            return (
              <button
                key={filter.key}
                type="button"
                onClick={() => onStatusChange(filter.key)}
                className={cn(
                  "rounded-lg px-3 py-1.5 font-title-md text-body-sm transition-all",
                  active
                    ? "bg-surface-container-lowest text-on-surface shadow-sm"
                    : "text-secondary hover:bg-surface-container-highest hover:text-on-surface",
                )}
              >
                {filter.label}
                <span className="ml-1 font-label-mono-xs text-label-mono-xs text-secondary">
                  {counts[filter.key]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
