"use client";

import { useMemo, useState } from "react";
import {
  ApprovalFilters,
  type ApprovalStatusFilter,
} from "@/components/approvals/ApprovalFilters";
import { ApprovalRow } from "@/components/approvals/ApprovalRow";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Select } from "@/components/ui/Select";
import {
  APPROVAL_STATE,
  normalizeApprovalState,
} from "@/lib/approvalService";
import { cn } from "@/lib/utils";
import type { Empresa, SolicitudActualizacion } from "@/types/api";

interface ApprovalTableProps {
  solicitudes: SolicitudActualizacion[];
  onReview: (solicitud: SolicitudActualizacion) => void;
}

const pageSizeOptions = [10, 25, 50];

function matchesQuery(solicitud: SolicitudActualizacion, query: string) {
  const value = query.trim().toLowerCase();
  const software = solicitud.actualizacion.software;

  if (!value) return true;

  return [
    solicitud.empresa.nombre,
    solicitud.empresa.identificador ?? "",
    software.nombre,
    software.fabricante ?? "",
    software.versionActual,
    solicitud.actualizacion.versionOrigen ?? "",
    solicitud.actualizacion.versionDestino,
    solicitud.actualizacion.tipoCambio,
    solicitud.solicitante.nombre,
    solicitud.solicitante.email,
    solicitud.estado,
    solicitud.observaciones ?? "",
  ]
    .join(" ")
    .toLowerCase()
    .includes(value);
}

function statusMatches(
  solicitud: SolicitudActualizacion,
  status: ApprovalStatusFilter,
) {
  const estado = normalizeApprovalState(solicitud.estado);

  if (status === "pending") return estado === APPROVAL_STATE.pending;
  if (status === "approved") return estado === APPROVAL_STATE.approved;
  if (status === "rejected") return estado === APPROVAL_STATE.rejected;

  return true;
}

function uniqueCompanies(solicitudes: SolicitudActualizacion[]) {
  const map = new Map<number, Empresa>();

  solicitudes.forEach((solicitud) => {
    map.set(solicitud.empresa.id, solicitud.empresa);
  });

  return Array.from(map.values()).sort((a, b) =>
    a.nombre.localeCompare(b.nombre, "es"),
  );
}

export function ApprovalTable({
  solicitudes,
  onReview,
}: ApprovalTableProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ApprovalStatusFilter>("all");
  const [companyId, setCompanyId] = useState<number | "all">("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const companies = useMemo(() => uniqueCompanies(solicitudes), [solicitudes]);

  const statusCounts = useMemo<Record<ApprovalStatusFilter, number>>(
    () => ({
      all: solicitudes.length,
      pending: solicitudes.filter((solicitud) =>
        statusMatches(solicitud, "pending"),
      ).length,
      approved: solicitudes.filter((solicitud) =>
        statusMatches(solicitud, "approved"),
      ).length,
      rejected: solicitudes.filter((solicitud) =>
        statusMatches(solicitud, "rejected"),
      ).length,
    }),
    [solicitudes],
  );

  const filtered = useMemo(
    () =>
      solicitudes.filter((solicitud) => {
        const matchesCompany =
          companyId === "all" || solicitud.empresa.id === companyId;

        return (
          matchesCompany &&
          statusMatches(solicitud, status) &&
          matchesQuery(solicitud, query)
        );
      }),
    [companyId, query, solicitudes, status],
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

  function handleStatusChange(value: ApprovalStatusFilter) {
    setStatus(value);
    setPage(1);
  }

  function handleCompanyChange(value: number | "all") {
    setCompanyId(value);
    setPage(1);
  }

  function handlePageSizeChange(value: number) {
    setPageSize(value);
    setPage(1);
  }

  function resetFilters() {
    setQuery("");
    setStatus("all");
    setCompanyId("all");
    setPage(1);
  }

  return (
    <>
      <ApprovalFilters
        query={query}
        onQueryChange={handleQueryChange}
        status={status}
        onStatusChange={handleStatusChange}
        statusCounts={statusCounts}
        companyId={companyId}
        onCompanyChange={handleCompanyChange}
        companies={companies}
        onReset={resetFilters}
      />

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container font-label-mono-xs text-label-mono-xs uppercase tracking-wider text-secondary">
                <th className="px-4 py-3 font-semibold">Empresa</th>
                <th className="px-4 py-3 font-semibold">Software / Versión</th>
                <th className="px-4 py-3 font-semibold">Solicitante</th>
                <th className="px-4 py-3 font-semibold">Ventana</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container bg-surface-container-lowest">
              {pageItems.length ? (
                pageItems.map((solicitud) => (
                  <ApprovalRow
                    key={solicitud.id}
                    solicitud={solicitud}
                    onReview={onReview}
                  />
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center font-body-md text-body-md text-secondary"
                  >
                    No se encontraron solicitudes con los filtros seleccionados.
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
                  solicitudes
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
                ariaLabel="Solicitudes por página"
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
