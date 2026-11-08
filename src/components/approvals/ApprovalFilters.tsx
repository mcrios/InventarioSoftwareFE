"use client";

import { Icon } from "@/components/ui/Icon";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils";
import type { Empresa } from "@/types/api";

export type ApprovalStatusFilter =
  | "all"
  | "pending"
  | "approved"
  | "rejected";

interface ApprovalFiltersProps {
  query: string;
  onQueryChange: (value: string) => void;
  status: ApprovalStatusFilter;
  onStatusChange: (status: ApprovalStatusFilter) => void;
  statusCounts: Record<ApprovalStatusFilter, number>;
  companyId: number | "all";
  onCompanyChange: (companyId: number | "all") => void;
  companies: Empresa[];
  onReset: () => void;
}

const statusFilters: Array<{ key: ApprovalStatusFilter; label: string }> = [
  { key: "all", label: "Todas" },
  { key: "pending", label: "Pendientes" },
  { key: "approved", label: "Aprobadas" },
  { key: "rejected", label: "Rechazadas" },
];

export function ApprovalFilters({
  query,
  onQueryChange,
  status,
  onStatusChange,
  statusCounts,
  companyId,
  onCompanyChange,
  companies,
  onReset,
}: ApprovalFiltersProps) {
  return (
    <div className="mb-5 flex flex-col gap-3 rounded-2xl bg-surface-container-low p-4 shadow-sm">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-xl bg-surface-container-lowest px-4 py-2 shadow-sm">
          <Icon name="search" className="text-[20px] text-secondary" />
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Buscar por empresa, software, versión o solicitante..."
            className="w-full bg-transparent font-body-md text-body-md text-on-surface placeholder:text-secondary focus:outline-none"
          />
          <span className="hidden rounded bg-surface-container px-2 py-0.5 font-label-mono-xs text-label-mono-xs text-secondary sm:inline">
            FILTRO ACTIVO
          </span>
        </div>

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
                  {statusCounts[filter.key]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-surface-variant pt-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-label-mono-xs text-label-mono-xs uppercase tracking-wider text-secondary">
            Empresa:
          </span>
          <Select
            value={companyId === "all" ? "all" : String(companyId)}
            onChange={(next) =>
              onCompanyChange(next === "all" ? "all" : Number(next))
            }
            options={[
              { value: "all", label: "Todas las empresas" },
              ...companies.map((empresa) => ({
                value: String(empresa.id),
                label: empresa.nombre,
                description: empresa.identificador ?? undefined,
              })),
            ]}
            ariaLabel="Filtrar solicitudes por empresa"
            size="sm"
            containerClassName="min-w-[200px]"
          />
          <span className="flex items-center gap-1.5 font-label-mono-xs text-label-mono-xs text-secondary">
            <Icon name="gavel" className="text-[16px]" />
            Solo se permite aprobar o rechazar solicitudes pendientes
          </span>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="w-fit rounded-lg px-2.5 py-1.5 font-label-mono-xs text-label-mono-xs text-secondary transition-colors hover:bg-surface-container hover:text-on-surface"
        >
          Restablecer filtros
        </button>
      </div>
    </div>
  );
}
