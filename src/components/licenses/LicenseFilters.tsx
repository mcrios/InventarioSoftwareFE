"use client";

import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import type { Empresa } from "@/types/api";

export type LicenseStatusFilter =
  | "all"
  | "vigente"
  | "por_vencer"
  | "vencida"
  | "agotada";

interface LicenseFiltersProps {
  query: string;
  onQueryChange: (value: string) => void;
  status: LicenseStatusFilter;
  onStatusChange: (status: LicenseStatusFilter) => void;
  empresaId: string;
  onEmpresaIdChange: (empresaId: string) => void;
  empresas: Empresa[];
  counts: Record<LicenseStatusFilter, number>;
  onReset: () => void;
}

const statusFilters: Array<{ key: LicenseStatusFilter; label: string }> = [
  { key: "all", label: "Todas" },
  { key: "vigente", label: "Vigentes" },
  { key: "por_vencer", label: "Por vencer" },
  { key: "vencida", label: "Vencidas" },
  { key: "agotada", label: "Agotadas" },
];

export function LicenseFilters({
  query,
  onQueryChange,
  status,
  onStatusChange,
  empresaId,
  onEmpresaIdChange,
  empresas,
  counts,
  onReset,
}: LicenseFiltersProps) {
  const hasActiveFilters =
    Boolean(query) || status !== "all" || Boolean(empresaId);

  return (
    <div className="mb-5 flex flex-col gap-3 rounded-2xl bg-surface-container-low p-4 shadow-sm">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        {/* Buscador */}
        <div className="flex flex-1 items-center gap-2 rounded-xl bg-surface-container-lowest px-4 py-2 shadow-sm">
          <Icon name="search" className="text-[20px] text-secondary" />
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Buscar por clave, empresa o documento..."
            className="w-full bg-transparent font-body-md text-body-md text-on-surface placeholder:text-secondary focus:outline-none"
          />
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="rounded-lg bg-surface-container px-2 py-1 font-label-mono-xs text-label-mono-xs text-secondary hover:text-on-surface"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Filtro por empresa */}
        <div className="flex items-center gap-2">
          <select
            value={empresaId}
            onChange={(event) => onEmpresaIdChange(event.target.value)}
            className="rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2 font-body-sm text-body-sm text-on-surface shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Todas las empresas</option>
            {empresas.map((emp) => (
              <option key={emp.id} value={String(emp.id)}>
                {emp.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Tabs de estado */}
        <div className="flex flex-wrap items-center gap-1 rounded-xl bg-surface-container p-1 shadow-sm">
          {statusFilters.map((filter) => {
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

