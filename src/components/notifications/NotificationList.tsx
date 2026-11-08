"use client";

import { useMemo, useState } from "react";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { getNotificationTypeMeta } from "@/components/notifications/notificationMeta";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils";
import type { Notificacion } from "@/types/api";

type NotificationStatusFilter = "all" | "unread" | "read";

interface NotificationListProps {
  notificaciones: Notificacion[];
  markingId: number | null;
  onMarkRead: (notificacion: Notificacion) => void;
  onDelete: (notificacion: Notificacion) => void;
}

const pageSizeOptions = [10, 25, 50];

const statusFilters: Array<{ key: NotificationStatusFilter; label: string }> = [
  { key: "all", label: "Todas" },
  { key: "unread", label: "No leídas" },
  { key: "read", label: "Leídas" },
];

function matchesQuery(notificacion: Notificacion, query: string) {
  const value = query.trim().toLowerCase();

  if (!value) return true;

  return [
    notificacion.titulo,
    notificacion.mensaje,
    notificacion.tipo,
    getNotificationTypeMeta(notificacion.tipo).label,
    notificacion.usuario?.nombre ?? "",
    notificacion.usuario?.email ?? "",
    ...(notificacion.usuario?.empresas?.map((empresa) => empresa.nombre) ?? []),
  ]
    .join(" ")
    .toLowerCase()
    .includes(value);
}

function statusMatches(
  notificacion: Notificacion,
  status: NotificationStatusFilter,
) {
  if (status === "unread") return !notificacion.leida;
  if (status === "read") return Boolean(notificacion.leida);

  return true;
}

export function NotificationList({
  notificaciones,
  markingId,
  onMarkRead,
  onDelete,
}: NotificationListProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<NotificationStatusFilter>("all");
  const [tipo, setTipo] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const statusCounts = useMemo<Record<NotificationStatusFilter, number>>(
    () => ({
      all: notificaciones.length,
      unread: notificaciones.filter((notificacion) => !notificacion.leida)
        .length,
      read: notificaciones.filter((notificacion) => notificacion.leida).length,
    }),
    [notificaciones],
  );

  const typeOptions = useMemo(() => {
    const map = new Map<string, string>();

    notificaciones.forEach((notificacion) => {
      map.set(
        notificacion.tipo,
        getNotificationTypeMeta(notificacion.tipo).label,
      );
    });

    return Array.from(map.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label, "es"));
  }, [notificaciones]);

  const filtered = useMemo(
    () =>
      notificaciones.filter(
        (notificacion) =>
          (tipo === "all" || notificacion.tipo === tipo) &&
          statusMatches(notificacion, status) &&
          matchesQuery(notificacion, query),
      ),
    [notificaciones, query, status, tipo],
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

  function handleStatusChange(value: NotificationStatusFilter) {
    setStatus(value);
    setPage(1);
  }

  function handleTypeChange(value: string) {
    setTipo(value);
    setPage(1);
  }

  function handlePageSizeChange(value: number) {
    setPageSize(value);
    setPage(1);
  }

  function resetFilters() {
    setQuery("");
    setStatus("all");
    setTipo("all");
    setPage(1);
  }

  return (
    <>
      <div className="mb-5 flex flex-col gap-3 rounded-2xl bg-surface-container-low p-4 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="flex flex-1 items-center gap-2 rounded-xl bg-surface-container-lowest px-4 py-2 shadow-sm">
            <Icon name="search" className="text-[20px] text-secondary" />
            <input
              type="search"
              value={query}
              onChange={(event) => handleQueryChange(event.target.value)}
              placeholder="Buscar por título, mensaje, usuario o empresa..."
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
                  onClick={() => handleStatusChange(filter.key)}
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
              Tipo:
            </span>
            <Select
              value={tipo}
              onChange={handleTypeChange}
              options={[
                { value: "all", label: "Todos los tipos" },
                ...typeOptions,
              ]}
              ariaLabel="Filtrar notificaciones por tipo"
              size="sm"
              containerClassName="min-w-[180px]"
            />
            <span className="flex items-center gap-1.5 font-label-mono-xs text-label-mono-xs text-secondary">
              <Icon name="info" className="text-[16px]" />
              Los avisos se generan desde los flujos de aprobación y
              actualización
            </span>
          </div>

          <button
            type="button"
            onClick={resetFilters}
            className="w-fit rounded-lg px-2.5 py-1.5 font-label-mono-xs text-label-mono-xs text-secondary transition-colors hover:bg-surface-container hover:text-on-surface"
          >
            Restablecer filtros
          </button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-surface-variant px-4 py-3">
          <h2 className="font-headline-sm text-body-lg font-semibold text-on-surface">
            Bandeja de notificaciones
          </h2>
          <span className="rounded-full bg-surface-container px-2.5 py-0.5 font-label-mono-sm text-label-mono-sm font-semibold text-on-surface">
            {filtered.length} resultados
          </span>
        </div>

        {pageItems.length ? (
          <ul className="divide-y divide-surface-container">
            {pageItems.map((notificacion) => (
              <NotificationItem
                key={notificacion.id}
                notificacion={notificacion}
                marking={markingId === notificacion.id}
                onMarkRead={onMarkRead}
                onDelete={onDelete}
              />
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-3 px-4 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-container text-secondary">
              <Icon name="notifications_off" className="text-[24px]" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-title-md text-body-md text-on-surface">
                No hay notificaciones
              </span>
              <span className="max-w-md font-body-sm text-body-sm text-secondary">
                No se encontraron avisos con los filtros seleccionados. Cuando
                se apruebe una actualización, los usuarios de la empresa
                recibirán sus notificaciones aquí.
              </span>
            </div>
          </div>
        )}

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
                  notificaciones
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
                ariaLabel="Notificaciones por página"
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
