"use client";

import { Icon } from "@/components/ui/Icon";
import { Select } from "@/components/ui/Select";
import type { Empresa } from "@/types/api";

interface EquipmentFiltersProps {
  query: string;
  onQueryChange: (value: string) => void;
  tipo: string;
  onTipoChange: (value: string) => void;
  empresaId: number | "all";
  onEmpresaChange: (value: number | "all") => void;
  tipos: string[];
  empresas: Empresa[];
  onReset: () => void;
}

const selectOptions = (tipos: string[]) => [
  { value: "all", label: "Todos los tipos" },
  ...tipos.map((tipo) => ({ value: tipo, label: tipo })),
];

export function EquipmentFilters({
  query,
  onQueryChange,
  tipo,
  onTipoChange,
  empresaId,
  onEmpresaChange,
  tipos,
  empresas,
  onReset,
}: EquipmentFiltersProps) {
  return (
    <div className="mb-5 flex flex-col gap-3 rounded-2xl bg-surface-container-low p-4 shadow-sm">
      <div className="flex flex-1 items-center gap-2 rounded-xl bg-surface-container-lowest px-4 py-2 shadow-sm">
        <Icon name="search" className="text-[20px] text-secondary" />
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Buscar por nombre, fabricante, IP, responsable o ubicación..."
          className="w-full bg-transparent font-body-md text-body-md text-on-surface placeholder:text-secondary focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-3 border-t border-surface-variant pt-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-label-mono-xs text-label-mono-xs uppercase tracking-wider text-secondary">
            Tipo:
          </span>
          <Select
            value={tipo}
            onChange={onTipoChange}
            options={selectOptions(tipos)}
            ariaLabel="Filtrar equipos por tipo"
            size="sm"
            searchable={tipos.length > 5}
            containerClassName="min-w-[170px]"
          />

          <span className="font-label-mono-xs text-label-mono-xs uppercase tracking-wider text-secondary">
            Empresa:
          </span>
          <Select
            value={empresaId === "all" ? "all" : String(empresaId)}
            onChange={(next) =>
              onEmpresaChange(next === "all" ? "all" : Number(next))
            }
            options={[
              { value: "all", label: "Todas las empresas" },
              ...empresas.map((empresa) => ({
                value: String(empresa.id),
                label: empresa.nombre,
                description: empresa.identificador ?? undefined,
              })),
            ]}
            ariaLabel="Filtrar equipos por empresa"
            size="sm"
            containerClassName="min-w-[200px]"
          />
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
