"use client";

import { useMemo, useState } from "react";
import {
  LicenseFilters,
  type LicenseStatusFilter,
} from "@/components/licenses/LicenseFilters";
import { LicenseRow } from "@/components/licenses/LicenseRow";
import { getLicenseStatusInfo } from "@/components/licenses/licenseStatus";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import type { Empresa, Licencia } from "@/types/api";

interface LicenseTableProps {
  licencias: Licencia[];
  empresas: Empresa[];
  onEdit: (licencia: Licencia) => void;
  onRenew: (licencia: Licencia) => void;
  onDelete: (licencia: Licencia) => void;
  onNewLicense: () => void;
}

const pageSizeOptions = [10, 25, 50, 100];

function matchesQuery(licencia: Licencia, query: string) {
  const value = query.trim().toLowerCase();
  if (!value) return true;
  return [
    licencia.codigoClave ?? "",
    licencia.empresa?.nombre ?? "",
    licencia.archivoUrl ?? "",
    `id #${licencia.id}`,
    String(licencia.id),
  ]
    .join(" ")
    .toLowerCase()
    .includes(value);
}

export function LicenseTable({
  licencias,
  empresas,
  onEdit,
  onRenew,
  onDelete,
  onNewLicense,
}: LicenseTableProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<LicenseStatusFilter>("all");
  const [empresaId, setEmpresaId] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Cache status info for each license
  const statusInfoMap = useMemo(() => {
    const map = new Map<number, ReturnType<typeof getLicenseStatusInfo>>();
    licencias.forEach((lic) => {
      map.set(lic.id, getLicenseStatusInfo(lic));
    });
    return map;
  }, [licencias]);

  // Compute counts for the filter tabs
  const counts = useMemo(() => {
    let vigente = 0;
    let porVencer = 0;
    let vencida = 0;
    let agotada = 0;
    licencias.forEach((lic) => {
      const info = statusInfoMap.get(lic.id);
      if (!info) return;
      if (info.expirationState === "VIGENTE" || info.expirationState === "PERPETUA") {
        vigente += 1;
      } else if (info.expirationState === "POR_VENCER") {
        porVencer += 1;
      } else if (info.expirationState === "VENCIDA") {
        vencida += 1;
      }
      if (info.isExhausted) {
        agotada += 1;
      }
    });
    return { all: licencias.length, vigente, por_vencer: porVencer, vencida, agotada };
  }, [licencias, statusInfoMap]);

  // Apply all filters
  const filtered = useMemo(() => {
    return licencias.filter((lic) => {
      if (empresaId && String(lic.empresa?.id) !== empresaId) return false;
      const info = statusInfoMap.get(lic.id);
      if (!info) return false;
      if (status === "vigente" && !(info.expirationState === "VIGENTE" || info.expirationState === "PERPETUA")) return false;
      if (status === "por_vencer" && info.expirationState !== "POR_VENCER") return false;
      if (status === "vencida" && info.expirationState !== "VENCIDA") return false;
      if (status === "agotada" && !info.isExhausted) return false;
      return matchesQuery(lic, query);
    });
  }, [licencias, empresaId, status, query, statusInfoMap]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);
  const end = start + pageItems.length;

  const pageNumbers = useMemo(() => {
    const windowSize = 5;
    const windowStart = Math.max(1, Math.min(currentPage, Math.max(1, totalPages - windowSize + 1)));
    const windowEnd = Math.min(totalPages, windowStart + windowSize - 1);
    const pages: number[] = [];
    for (let i = windowStart; i <= windowEnd; i++) pages.push(i);
    return pages;
  }, [currentPage, totalPages]);

  function handleQueryChange(value: string) {
    setQuery(value);
    setPage(1);
  }
  function handleStatusChange(value: LicenseStatusFilter) {
    setStatus(value);
    setPage(1);
  }
  function handleEmpresaChange(value: string) {
    setEmpresaId(value);
    setPage(1);
  }
  function handlePageSizeChange(value: number) {
    setPageSize(value);
    setPage(1);
  }
  function resetFilters() {
    setQuery("");
    setStatus("all");
    setEmpresaId("");
    setPage(1);
  }

  return (
    <>
      <LicenseFilters
        query={query}
        onQueryChange={handleQueryChange}
        status={status}
        onStatusChange={handleStatusChange}
        empresaId={empresaId}
        onEmpresaIdChange={handleEmpresaChange}
        empresas={empresas}
        counts={counts}
        onReset={resetFilters}
      />
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container font-label-mono-xs text-label-mono-xs uppercase tracking-wider text-secondary">
                <th className="px-4 py-3 font-semibold">Clave / Licencia</th>
                <th className="px-4 py-3 font-semibold">Empresa</th>
                <th className="px-4 py-3 font-semibold">Cantidad de instalaciones</th>
                <th className="px-4 py-3 font-semibold">Vigencia / Vencimiento</th>
                <th className="px-4 py-3 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container bg-surface-container-lowest">
              {pageItems.length ? (
                pageItems.map((licencia) => (
                  <LicenseRow
                    key={licencia.id}
                    licencia={licencia}
                    onEdit={onEdit}
                    onRenew={onRenew}
                    onDelete={onDelete}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-14 text-center font-body-md text-secondary">
                    <div className="mx-auto flex max-w-sm flex-col items-center gap-2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-container text-secondary">
                        <Icon name="key" className="text-[28px]" />
                      </div>
                      <span className="font-title-md text-body-lg text-on-surface">No se encontraron licencias</span>
                      <p className="font-body-sm text-secondary">
                        {licencias.length === 0
                          ? "Comienza registrando la primera licencia para una empresa."
                          : "No hay licencias que coincidan con los filtros de búsqueda aplicados."}
                      </p>
                      {licencias.length === 0 && (
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          onClick={onNewLicense}
                          className="mt-2"
                        >
                          <Icon name="add" className="text-[18px]" /> Registrar Primera Licencia
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-outline-variant/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 font-body-sm text-secondary">
              <span>
                Mostrando <strong className="text-on-surface">{start + 1}</strong> a <strong className="text-on-surface">{end}</strong> de <strong className="text-on-surface">{filtered.length}</strong> licencias
              </span>
              <span>•</span>
              <label htmlFor="license-page-size" className="sr-only">Licencias por página</label>
              <select
                id="license-page-size"
                value={pageSize}
                onChange={(e) => handlePageSizeChange(parseInt(e.target.value, 10))}
                className="rounded-lg border border-outline-variant bg-surface-container-lowest px-2 py-1 font-label-mono-xs text-on-surface focus:outline-none"
              >
                {pageSizeOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt} por página</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                aria-label="Página anterior"
                className="rounded-lg p-1.5 text-secondary transition-colors hover:bg-surface-container hover:text-on-surface disabled:opacity-30 disabled:pointer-events-none"
              >
                <Icon name="chevron_left" className="text-[20px]" />
              </button>
              {pageNumbers.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={cn(
                    "h-8 min-w-[2rem] rounded-lg px-2 font-label-mono-xs text-label-mono-xs transition-colors",
                    p === currentPage
                      ? "bg-primary-container font-bold text-on-primary"
                      : "text-secondary hover:bg-surface-container hover:text-on-surface"
                  )}
                >
                  {p}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                aria-label="Página siguiente"
                className="rounded-lg p-1.5 text-secondary transition-colors hover:bg-surface-container hover:text-on-surface disabled:opacity-30 disabled:pointer-events-none"
              >
                <Icon name="chevron_right" className="text-[20px]" />
              </button>
            </div>
          </div>
        )}
      </Card>
    </>
  );
}
