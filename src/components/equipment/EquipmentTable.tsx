"use client";

import { useMemo, useState } from "react";
import { EquipmentFilters } from "@/components/equipment/EquipmentFilters";
import { EquipmentRow } from "@/components/equipment/EquipmentRow";
import { collectEquipmentTypes } from "@/components/equipment/equipmentMeta";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils";
import type {
  Actualizacion,
  Empresa,
  Equipo,
  EquipoSoftware,
} from "@/types/api";

interface EquipmentTableProps {
  equipos: Equipo[];
  instalaciones: EquipoSoftware[];
  latestUpdates: Map<number, Actualizacion>;
  onView: (equipo: Equipo) => void;
  onEdit: (equipo: Equipo) => void;
  onDelete: (equipo: Equipo) => void;
}

const pageSizeOptions = [10, 25, 50];

function matchesQuery(equipo: Equipo, query: string, extra = "") {
  const value = query.trim().toLowerCase();

  if (!value) return true;

  return [
    equipo.nombre,
    equipo.tipo,
    equipo.fabricante ?? "",
    equipo.ip ?? "",
    equipo.ubicacion ?? "",
    equipo.salud ?? "",
    equipo.empresa.nombre,
    equipo.empresa.identificador ?? "",
    equipo.responsable?.nombre ?? "",
    equipo.responsable?.email ?? "",
    extra,
    `id #${equipo.id}`,
  ]
    .join(" ")
    .toLowerCase()
    .includes(value);
}

function uniqueCompanies(equipos: Equipo[]) {
  const map = new Map<number, Empresa>();

  equipos.forEach((equipo) => {
    map.set(equipo.empresa.id, equipo.empresa);
  });

  return Array.from(map.values()).sort((a, b) =>
    a.nombre.localeCompare(b.nombre, "es"),
  );
}

export function EquipmentTable({
  equipos,
  instalaciones,
  latestUpdates,
  onView,
  onEdit,
  onDelete,
}: EquipmentTableProps) {
  const [query, setQuery] = useState("");
  const [tipo, setTipo] = useState("all");
  const [empresaId, setEmpresaId] = useState<number | "all">("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const empresas = useMemo(() => uniqueCompanies(equipos), [equipos]);
  const tipos = useMemo(() => collectEquipmentTypes(equipos), [equipos]);

  const instalacionesPorEquipo = useMemo(() => {
    const map = new Map<number, EquipoSoftware[]>();

    instalaciones.forEach((instalacion) => {
      const list = map.get(instalacion.equipo.id);

      if (list) {
        list.push(instalacion);
      } else {
        map.set(instalacion.equipo.id, [instalacion]);
      }
    });

    return map;
  }, [instalaciones]);

  const filtered = useMemo(
    () =>
      equipos.filter((equipo) => {
        const matchesTipo = tipo === "all" || equipo.tipo === tipo;
        const matchesEmpresa =
          empresaId === "all" || equipo.empresa.id === empresaId;
        const extra = (instalacionesPorEquipo.get(equipo.id) ?? [])
          .map((instalacion) => instalacion.software.nombre)
          .join(" ");

        return (
          matchesTipo &&
          matchesEmpresa &&
          matchesQuery(equipo, query, extra)
        );
      }),
    [empresaId, equipos, instalacionesPorEquipo, query, tipo],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);
  const end = start + pageItems.length;

  const pageNumbers = useMemo(() => {
    const windowSize = 5;
    const windowStart = Math.max(
      1,
      Math.min(currentPage, Math.max(1, totalPages - windowSize + 1)),
    );
    const windowEnd = Math.min(totalPages, windowStart + windowSize - 1);
    const pages: number[] = [];

    for (let index = windowStart; index <= windowEnd; index += 1) {
      pages.push(index);
    }

    return pages;
  }, [currentPage, totalPages]);

  function handleQueryChange(value: string) {
    setQuery(value);
    setPage(1);
  }

  function handleTipoChange(value: string) {
    setTipo(value);
    setPage(1);
  }

  function handleEmpresaChange(value: number | "all") {
    setEmpresaId(value);
    setPage(1);
  }

  function handlePageSizeChange(value: number) {
    setPageSize(value);
    setPage(1);
  }

  function resetFilters() {
    setQuery("");
    setTipo("all");
    setEmpresaId("all");
    setPage(1);
  }

  return (
    <>
      <EquipmentFilters
        query={query}
        onQueryChange={handleQueryChange}
        tipo={tipo}
        onTipoChange={handleTipoChange}
        empresaId={empresaId}
        onEmpresaChange={handleEmpresaChange}
        tipos={tipos}
        empresas={empresas}
        onReset={resetFilters}
      />

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container font-label-mono-xs text-label-mono-xs uppercase tracking-wider text-secondary">
                <th className="px-4 py-3 font-semibold">Equipo</th>
                <th className="px-4 py-3 font-semibold">Empresa</th>
                <th className="px-4 py-3 font-semibold">Tipo / IP</th>
                <th className="px-4 py-3 font-semibold">Software</th>
                <th className="px-4 py-3 font-semibold">Responsable</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container bg-surface-container-lowest">
              {pageItems.length ? (
                pageItems.map((equipo) => (
                  <EquipmentRow
                    key={equipo.id}
                    equipo={equipo}
                    instalaciones={instalacionesPorEquipo.get(equipo.id) ?? []}
                    latestUpdates={latestUpdates}
                    onView={onView}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center font-body-md text-body-md text-secondary"
                  >
                    No se encontraron equipos con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 bg-surface-container-low p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-label-mono-xs text-label-mono-xs text-secondary">
              {filtered.length ? (
                <>
                  Mostrando{" "}
                  <strong className="text-on-surface">
                    {start + 1} a {end}
                  </strong>{" "}
                  de <strong className="text-on-surface">{filtered.length}</strong>{" "}
                  equipos
                </>
              ) : (
                "Sin resultados para los filtros actuales"
              )}
            </span>
            <div className="flex items-center gap-1.5 pl-3">
              <span className="font-label-mono-xs text-label-mono-xs text-secondary">
                Por página:
              </span>
              <Select
                value={String(pageSize)}
                onChange={(value) => handlePageSizeChange(Number(value))}
                options={pageSizeOptions.map((option) => ({
                  value: String(option),
                  label: String(option),
                }))}
                ariaLabel="Equipos por página"
                size="sm"
                searchable={false}
                containerClassName="w-20"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setPage(currentPage - 1)}
              aria-label="Página anterior"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container text-secondary transition-colors hover:bg-surface-container-high hover:text-on-surface disabled:opacity-40"
            >
              <Icon name="chevron_left" className="text-[18px]" />
            </button>

            {pageNumbers.map((pageNumber) => {
              const active = pageNumber === currentPage;

              return (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setPage(pageNumber)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg font-label-mono-xs text-label-mono-xs transition-colors",
                    active
                      ? "bg-primary-container font-bold text-on-primary shadow-sm"
                      : "bg-surface-container text-on-surface hover:bg-surface-container-high",
                  )}
                >
                  {pageNumber}
                </button>
              );
            })}

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setPage(currentPage + 1)}
              aria-label="Página siguiente"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container text-secondary transition-colors hover:bg-surface-container-high hover:text-on-surface disabled:opacity-40"
            >
              <Icon name="chevron_right" className="text-[18px]" />
            </button>
          </div>
        </div>
      </Card>
    </>
  );
}
