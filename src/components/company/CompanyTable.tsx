"use client";

import { useMemo, useState } from "react";
import { CompanyFilters, type CompanyStatusFilter } from "@/components/company/CompanyFilters";
import { CompanyRow } from "@/components/company/CompanyRow";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import type { Empresa, EmpresaInput } from "@/types/api";

interface CompanyTableProps {
  empresas: Empresa[];
  onUpdate: (id: number, input: EmpresaInput) => Promise<void>;
  onDelete: (empresa: Empresa) => void;
}

const pageSizeOptions = [10, 25, 50, 100];

function matchesQuery(empresa: Empresa, query: string) {
  const value = query.trim().toLowerCase();

  if (!value) return true;

  return [
    empresa.nombre,
    empresa.identificador ?? "",
    empresa.activo ? "activa activo" : "inactiva inactivo",
    `id #${empresa.id}`,
    String(empresa.id),
  ]
    .join(" ")
    .toLowerCase()
    .includes(value);
}

export function CompanyTable({
  empresas,
  onUpdate,
  onDelete,
}: CompanyTableProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<CompanyStatusFilter>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const counts = useMemo(
    () => ({
      all: empresas.length,
      active: empresas.filter((empresa) => empresa.activo).length,
      inactive: empresas.filter((empresa) => !empresa.activo).length,
    }),
    [empresas],
  );

  const filtered = useMemo(
    () =>
      empresas.filter((empresa) => {
        const matchesStatus =
          status === "all" ||
          (status === "active" && empresa.activo) ||
          (status === "inactive" && !empresa.activo);

        return matchesStatus && matchesQuery(empresa, query);
      }),
    [empresas, query, status],
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

  function handleStatusChange(value: CompanyStatusFilter) {
    setStatus(value);
    setPage(1);
  }

  function handlePageSizeChange(value: number) {
    setPageSize(value);
    setPage(1);
  }

  function resetFilters() {
    setQuery("");
    setStatus("all");
    setPage(1);
  }

  return (
    <>
      <CompanyFilters
        query={query}
        onQueryChange={handleQueryChange}
        status={status}
        onStatusChange={handleStatusChange}
        counts={counts}
        onReset={resetFilters}
      />

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container font-label-mono-xs text-label-mono-xs uppercase tracking-wider text-secondary">
                <th className="px-4 py-3 font-semibold">Empresa</th>
                <th className="px-4 py-3 font-semibold">Identificador</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold">Fecha de creación</th>
                <th className="px-4 py-3 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container bg-surface-container-lowest">
              {pageItems.length ? (
                pageItems.map((empresa) => (
                  <CompanyRow
                    key={empresa.id}
                    empresa={empresa}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                  />
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center font-body-md text-body-md text-secondary"
                  >
                    No se encontraron empresas con los filtros seleccionados.
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
                  empresas
                </>
              ) : (
                "Sin resultados para los filtros actuales"
              )}
            </span>
            <div className="flex items-center gap-1.5 pl-3">
              <span className="font-label-mono-xs text-label-mono-xs text-secondary">
                Por página:
              </span>
              <select
                value={pageSize}
                onChange={(event) =>
                  handlePageSizeChange(Number(event.target.value))
                }
                aria-label="Empresas por página"
                className="rounded-lg bg-surface-container px-2 py-1 font-label-mono-xs text-label-mono-xs text-on-surface focus:outline-none"
              >
                {pageSizeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
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
