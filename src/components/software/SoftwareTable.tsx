"use client";

import { useMemo, useState } from "react";
import { SoftwareFilters } from "@/components/software/SoftwareFilters";
import { SoftwareRow } from "@/components/software/SoftwareRow";
import { compareVersions } from "@/components/equipment/equipmentSoftware";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils";
import type {
  Actualizacion,
  Empresa,
  Software,
  SolicitudActualizacion,
  TipoSoftware,
} from "@/types/api";

interface SoftwareTableProps {
  software: Software[];
  actualizaciones: Actualizacion[];
  latestUpdates: Map<number, Actualizacion>;
  solicitudes: SolicitudActualizacion[];
  onEdit: (software: Software) => void;
  onCreateUpdate: (software: Software) => void;
  onRequestDeployment: (software: Software) => void;
}

const pageSizeOptions = [10, 25, 50];

function matchesQuery(
  software: Software,
  query: string,
  extra = "",
) {
  const value = query.trim().toLowerCase();

  if (!value) return true;

  return [
    software.nombre,
    software.fabricante ?? "",
    software.versionActual,
    software.tipoSoftware?.nombre ?? "",
    software.licencia.empresa.nombre,
    software.licencia.empresa.identificador ?? "",
    `licencia #${software.licencia.id}`,
    extra,
    `id #${software.id}`,
  ]
    .join(" ")
    .toLowerCase()
    .includes(value);
}

function uniqueCompanies(software: Software[]) {
  const map = new Map<number, Empresa>();

  software.forEach((item) => {
    map.set(item.licencia.empresa.id, item.licencia.empresa);
  });

  return Array.from(map.values()).sort((a, b) =>
    a.nombre.localeCompare(b.nombre, "es"),
  );
}

function uniqueTypes(software: Software[]) {
  const map = new Map<number, TipoSoftware>();

  software.forEach((item) => {
    if (item.tipoSoftware) {
      map.set(item.tipoSoftware.id, item.tipoSoftware);
    }
  });

  return Array.from(map.values()).sort((a, b) =>
    a.nombre.localeCompare(b.nombre, "es"),
  );
}

export function SoftwareTable({
  software,
  actualizaciones,
  latestUpdates,
  solicitudes,
  onEdit,
  onCreateUpdate,
  onRequestDeployment,
}: SoftwareTableProps) {
  const [query, setQuery] = useState("");
  const [empresaId, setEmpresaId] = useState<number | "all">("all");
  const [tipoId, setTipoId] = useState<number | "all">("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const empresas = useMemo(() => uniqueCompanies(software), [software]);
  const tipos = useMemo(() => uniqueTypes(software), [software]);

  const updatesBySoftware = useMemo(() => {
    const map = new Map<number, Actualizacion[]>();

    actualizaciones.forEach((actualizacion) => {
      const softwareId = actualizacion.software?.id;

      if (!softwareId) return;

      const list = map.get(softwareId);

      if (list) {
        list.push(actualizacion);
      } else {
        map.set(softwareId, [actualizacion]);
      }
    });

    map.forEach((list) => {
      list.sort((a, b) => compareVersions(b.versionDestino, a.versionDestino));
    });

    return map;
  }, [actualizaciones]);

  const solicitudBySoftware = useMemo(() => {
    const map = new Map<number, SolicitudActualizacion>();

    solicitudes.forEach((solicitud) => {
      const softwareId = solicitud.actualizacion?.software?.id;

      if (!softwareId) return;

      const current = map.get(softwareId);

      if (!current || solicitud.id > current.id) {
        map.set(softwareId, solicitud);
      }
    });

    return map;
  }, [solicitudes]);

  const filtered = useMemo(
    () =>
      software.filter((item) => {
        const matchesEmpresa =
          empresaId === "all" || item.licencia.empresa.id === empresaId;
        const matchesTipo =
          tipoId === "all" || item.tipoSoftware?.id === tipoId;
        const extra = (updatesBySoftware.get(item.id) ?? [])
          .flatMap((actualizacion) => [
            actualizacion.versionDestino,
            actualizacion.versionOrigen ?? "",
            actualizacion.tipoCambio,
          ])
          .join(" ");

        return (
          matchesEmpresa && matchesTipo && matchesQuery(item, query, extra)
        );
      }),
    [empresaId, software, tipoId, updatesBySoftware, query],
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

  function handleEmpresaChange(value: number | "all") {
    setEmpresaId(value);
    setPage(1);
  }

  function handleTipoChange(value: number | "all") {
    setTipoId(value);
    setPage(1);
  }

  function handlePageSizeChange(value: number) {
    setPageSize(value);
    setPage(1);
  }

  function resetFilters() {
    setQuery("");
    setEmpresaId("all");
    setTipoId("all");
    setPage(1);
  }

  return (
    <>
      <SoftwareFilters
        query={query}
        onQueryChange={handleQueryChange}
        empresaId={empresaId}
        onEmpresaChange={handleEmpresaChange}
        tipoId={tipoId}
        onTipoChange={handleTipoChange}
        empresas={empresas}
        tipos={tipos}
        onReset={resetFilters}
      />

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container font-label-mono-xs text-label-mono-xs uppercase tracking-wider text-secondary">
                <th className="px-4 py-3 font-semibold">Software</th>
                <th className="px-4 py-3 font-semibold">Empresa / Licencia</th>
                <th className="px-4 py-3 font-semibold">Versión</th>
                <th className="px-4 py-3 font-semibold">Actualizaciones</th>
                <th className="px-4 py-3 font-semibold">Solicitud</th>
                <th className="px-4 py-3 text-center font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container bg-surface-container-lowest">
              {pageItems.length ? (
                pageItems.map((item) => (
                  <SoftwareRow
                    key={item.id}
                    software={item}
                    updates={updatesBySoftware.get(item.id) ?? []}
                    latestUpdate={latestUpdates.get(item.id) ?? null}
                    solicitud={solicitudBySoftware.get(item.id) ?? null}
                    onEdit={onEdit}
                    onCreateUpdate={onCreateUpdate}
                    onRequestDeployment={onRequestDeployment}
                  />
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center font-body-md text-body-md text-secondary"
                  >
                    No se encontraron registros de software con los filtros
                    seleccionados.
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
                  de{" "}
                  <strong className="text-on-surface">{filtered.length}</strong>{" "}
                  registros
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
                ariaLabel="Registros de software por página"
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
