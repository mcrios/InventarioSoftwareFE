"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  getInstallationLicense,
  getInstallationTargetVersion,
  getLicenseExpiryMeta,
  isInstallationOutdated,
  type SoftwareAssignment,
} from "@/components/equipment/equipmentSoftware";
import {
  getEquipmentHealthMeta,
  getEquipmentIcon,
} from "@/components/equipment/equipmentMeta";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { formatDate, formatDateTime } from "@/lib/format";
import { cn, getErrorMessage } from "@/lib/utils";
import type {
  Actualizacion,
  Equipo,
  EquipoSoftware,
  Software,
} from "@/types/api";

interface EquipmentDetailModalProps {
  equipo: Equipo;
  instalaciones: EquipoSoftware[];
  latestUpdates: Map<number, Actualizacion>;
  software: Software[];
  onAssign: (assignments: SoftwareAssignment[]) => Promise<void>;
  onRemove: (instalacion: EquipoSoftware) => Promise<void>;
  onClose: () => void;
}

function DetailItem({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-surface-container-low px-3 py-2.5">
      <span className="font-label-mono-xs text-label-mono-xs uppercase tracking-wider text-secondary">
        {label}
      </span>
      <div className="font-body-sm text-body-sm text-on-surface">{children}</div>
    </div>
  );
}

export function EquipmentDetailModal({
  equipo,
  instalaciones,
  latestUpdates,
  software,
  onAssign,
  onRemove,
  onClose,
}: EquipmentDetailModalProps) {
  const [assigning, setAssigning] = useState(false);
  const [selected, setSelected] = useState<Record<number, string>>({});
  const [busy, setBusy] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const health = getEquipmentHealthMeta(equipo.salud);
  const pendientes = instalaciones.filter((instalacion) =>
    isInstallationOutdated(instalacion, latestUpdates),
  ).length;

  const availableSoftware = useMemo(() => {
    const installed = new Set(
      instalaciones.map((instalacion) => instalacion.software.id),
    );

    return software
      .filter(
        (item) =>
          item.licencia?.empresa?.id === equipo.empresa.id &&
          !installed.has(item.id),
      )
      .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  }, [equipo.empresa.id, instalaciones, software]);

  const selectedCount = Object.keys(selected).length;

  function toggleSoftware(item: Software) {
    setSelected((current) => {
      const next = { ...current };

      if (item.id in next) {
        delete next[item.id];
      } else {
        next[item.id] = item.versionActual;
      }

      return next;
    });
    setActionError(null);
  }

  function updateVersion(softwareId: number, value: string) {
    setSelected((current) => ({ ...current, [softwareId]: value }));
  }

  async function handleAssign() {
    const assignments: SoftwareAssignment[] = Object.entries(selected).flatMap(
      ([softwareId, version]) => {
        const item = software.find((entry) => entry.id === Number(softwareId));

        if (!item) return [];

        return [
          {
            softwareId: item.id,
            licenciaId: item.licencia?.id ?? null,
            versionInstalada: version.trim() || item.versionActual,
          },
        ];
      },
    );

    if (!assignments.length) {
      setAssigning(false);
      return;
    }

    setBusy(true);
    setActionError(null);

    try {
      await onAssign(assignments);
      setSelected({});
      setAssigning(false);
    } catch (assignError) {
      setActionError(getErrorMessage(assignError));
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove(instalacion: EquipoSoftware) {
    setRemovingId(instalacion.id);
    setActionError(null);

    try {
      await onRemove(instalacion);
    } catch (removeError) {
      setActionError(getErrorMessage(removeError));
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title="Ficha técnica del equipo"
      description={`${equipo.nombre} · ${equipo.empresa.nombre}`}
      footer={
        <Button variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-3 rounded-2xl bg-dark px-4 py-4 text-on-dark">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-on-dark/10">
              <Icon
                name={getEquipmentIcon(equipo.tipo)}
                className="text-[26px]"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-on-dark">
                {equipo.nombre}
              </span>
              <span className="font-body-sm text-body-sm text-on-dark/70">
                {[equipo.tipo, equipo.fabricante]
                  .filter(Boolean)
                  .join(" · ") || "Sin tipo ni fabricante"}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-on-dark/10 px-2.5 py-1 font-label-mono-xs text-label-mono-xs">
              <Icon name={health.icon} className="text-[13px]" />
              {health.label}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-on-dark/10 px-2.5 py-1 font-label-mono-xs text-label-mono-xs">
              <Icon name="apps" className="text-[13px]" />
              {instalaciones.length} software
            </span>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <DetailItem label="Empresa">
            {equipo.empresa.nombre}
            {equipo.empresa.identificador ? (
              <span className="ml-1 text-secondary">
                ({equipo.empresa.identificador})
              </span>
            ) : null}
          </DetailItem>

          <DetailItem label="Responsable">
            {equipo.responsable ? (
              <>
                {equipo.responsable.nombre}
                <span className="mt-0.5 block font-label-mono-xs text-label-mono-xs text-secondary">
                  {equipo.responsable.email}
                </span>
              </>
            ) : (
              <span className="text-secondary">Sin asignar</span>
            )}
          </DetailItem>

          <DetailItem label="Dirección IP">
            <span className="font-code-md text-code-md">
              {equipo.ip || "Sin IP"}
            </span>
          </DetailItem>

          <DetailItem label="Ubicación">
            {equipo.ubicacion || (
              <span className="text-secondary">Sin ubicación</span>
            )}
          </DetailItem>

          <DetailItem label="Fecha de alta">
            {formatDate(equipo.fechaCreacion)}
          </DetailItem>

          <DetailItem label="Actualizaciones pendientes">
            {pendientes ? (
              <span className="flex items-center gap-1.5 text-error">
                <Icon name="system_update_alt" className="text-[16px]" />
                {pendientes} software por actualizar
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-secondary">
                <Icon name="check_circle" className="text-[16px]" />
                Todo actualizado
              </span>
            )}
          </DetailItem>
        </div>

        <section className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h3 className="font-title-md text-body-md text-on-surface">
                Software instalado
              </h3>
              <span className="rounded-full bg-surface-container px-2.5 py-0.5 font-label-mono-xs text-label-mono-xs text-secondary">
                {instalaciones.length} registro
                {instalaciones.length === 1 ? "" : "s"}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setAssigning((current) => !current);
                setActionError(null);
              }}
              disabled={busy || removingId !== null}
            >
              <Icon
                name={assigning ? "close" : "add"}
                className="text-[16px]"
              />
              <span>{assigning ? "Cancelar asignación" : "Asignar software"}</span>
            </Button>
          </div>

          {actionError ? (
            <div className="flex items-start gap-2 rounded-xl bg-error-container px-3 py-2.5 font-body-sm text-body-sm text-on-error-container">
              <Icon name="error" className="mt-0.5 text-[18px]" filled />
              <span>{actionError}</span>
            </div>
          ) : null}

          {assigning ? (
            <div className="rounded-xl border border-primary-container/40 bg-surface-container-low p-3.5">
              {availableSoftware.length ? (
                <>
                  <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
                    <span className="font-label-mono-xs text-label-mono-xs uppercase tracking-wider text-secondary">
                      Software de {equipo.empresa.nombre} sin instalar
                    </span>
                    <span className="rounded-full bg-surface-container px-2.5 py-0.5 font-label-mono-xs text-label-mono-xs text-secondary">
                      {selectedCount} seleccionado
                      {selectedCount === 1 ? "" : "s"}
                    </span>
                  </div>

                  <ul className="flex flex-col gap-2">
                    {availableSoftware.map((item) => {
                      const version = selected[item.id];
                      const isSelected = version !== undefined;

                      return (
                        <li
                          key={item.id}
                          className={cn(
                            "rounded-xl border p-3 transition-colors",
                            isSelected
                              ? "border-primary-container bg-primary-container/[0.04]"
                              : "border-surface-variant bg-surface-container-lowest",
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              id={`detail-software-${item.id}`}
                              checked={isSelected}
                              onChange={() => toggleSoftware(item)}
                              className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-primary-container"
                            />

                            <div className="flex min-w-0 flex-1 flex-col gap-1">
                              <label
                                htmlFor={`detail-software-${item.id}`}
                                className="flex cursor-pointer flex-wrap items-center gap-2"
                              >
                                <span className="font-title-md text-body-sm text-on-surface">
                                  {item.nombre}
                                </span>
                                <span className="rounded bg-surface-container px-2 py-0.5 font-label-mono-xs text-label-mono-xs text-secondary">
                                  catálogo v{item.versionActual}
                                </span>
                              </label>

                              <span className="font-label-mono-xs text-label-mono-xs text-secondary">
                                {[item.fabricante, item.tipoSoftware?.nombre]
                                  .filter(Boolean)
                                  .join(" · ") || "Sin fabricante"}
                                {item.licencia
                                  ? ` · Licencia #${item.licencia.id}`
                                  : ""}
                              </span>

                              {isSelected ? (
                                <div className="mt-1.5 max-w-xs">
                                  <Input
                                    label="Versión instalada"
                                    name={`detail-version-${item.id}`}
                                    icon="tag"
                                    value={version}
                                    onChange={(event) =>
                                      updateVersion(
                                        item.id,
                                        event.target.value,
                                      )
                                    }
                                    placeholder={item.versionActual}
                                  />
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>

                  <div className="mt-3 flex justify-end">
                    <Button
                      onClick={() => void handleAssign()}
                      disabled={busy || selectedCount === 0}
                    >
                      <Icon
                        name={busy ? "progress_activity" : "add"}
                        className={cn("text-[17px]", busy && "animate-spin")}
                      />
                      <span>
                        {busy
                          ? "Asignando..."
                          : `Asignar ${selectedCount || ""}`.trim()}
                      </span>
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 px-4 py-5 text-center">
                  <Icon
                    name="apps"
                    className="text-[24px] text-secondary"
                  />
                  <span className="font-title-md text-body-sm text-on-surface">
                    No hay software pendiente de asignar
                  </span>
                  <span className="max-w-md font-body-sm text-body-sm text-secondary">
                    Todo el software con licencia de{" "}
                    {equipo.empresa.nombre} ya está registrado en este equipo.
                  </span>
                </div>
              )}
            </div>
          ) : null}

          {instalaciones.length ? (
            <ul className="flex flex-col gap-2.5">
              {instalaciones.map((instalacion) => {
                const softwareItem = instalacion.software;
                const targetVersion = getInstallationTargetVersion(
                  instalacion,
                  latestUpdates,
                );
                const pending = isInstallationOutdated(
                  instalacion,
                  latestUpdates,
                );
                const licencia = getInstallationLicense(instalacion);
                const expiry = getLicenseExpiryMeta(
                  licencia?.fechaVencimiento,
                );
                const removing = removingId === instalacion.id;

                return (
                  <li
                    key={instalacion.id}
                    className={cn(
                      "rounded-xl border bg-surface-container-lowest p-3.5",
                      pending
                        ? "border-error-container"
                        : "border-surface-variant",
                    )}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-container text-on-surface">
                          <Icon name="apps" className="text-[20px]" />
                        </div>
                        <div className="flex min-w-0 flex-col gap-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-title-md text-body-sm text-on-surface">
                              {softwareItem.nombre}
                            </span>
                            <Badge tone={pending ? "warning" : "success"}>
                              <Icon
                                name={
                                  pending ? "system_update_alt" : "check_circle"
                                }
                                className="text-[13px]"
                              />
                              {pending ? "Actualización pendiente" : "Actualizado"}
                            </Badge>
                          </div>
                          <span className="font-label-mono-xs text-label-mono-xs text-secondary">
                            {[
                              softwareItem.fabricante,
                              softwareItem.tipoSoftware?.nombre,
                            ]
                              .filter(Boolean)
                              .join(" · ") || "Sin fabricante"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <div className="flex flex-col items-end gap-1">
                          <span className="font-label-mono-xs text-label-mono-xs uppercase tracking-wider text-secondary">
                            Versión instalada
                          </span>
                          <span className="flex items-center gap-1.5 font-code-md text-code-md text-on-surface">
                            {instalacion.versionInstalada}
                            {pending ? (
                              <>
                                <Icon
                                  name="arrow_forward"
                                  className="text-[14px] text-secondary"
                                />
                                <span className="font-semibold text-error">
                                  {targetVersion}
                                </span>
                              </>
                            ) : null}
                          </span>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => void handleRemove(instalacion)}
                          disabled={busy || removingId !== null}
                          className="text-error hover:bg-error-container"
                          aria-label={`Quitar ${softwareItem.nombre}`}
                          title="Quitar del equipo"
                        >
                          <Icon
                            name={
                              removing ? "progress_activity" : "delete"
                            }
                            className={cn(
                              "text-[17px]",
                              removing && "animate-spin",
                            )}
                          />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                      <DetailItem label="Licencia">
                        {licencia ? (
                          <>
                            <span className="font-code-md text-code-md">
                              #{licencia.id}
                            </span>
                            <span className="ml-2 text-secondary">
                              {licencia.cantidadUsada}/{licencia.cantidadTotal}{" "}
                              asientos
                            </span>
                          </>
                        ) : (
                          <span className="text-secondary">Sin licencia</span>
                        )}
                      </DetailItem>

                      <DetailItem label="Vencimiento de licencia">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5",
                            expiry.state === "expired" && "text-error",
                            expiry.state === "soon" &&
                              "text-on-secondary-container",
                          )}
                        >
                          <Icon name={expiry.icon} className="text-[15px]" />
                          {expiry.label}
                        </span>
                      </DetailItem>

                      <DetailItem label="Instalado el">
                        {formatDateTime(instalacion.fechaInstalacion)}
                      </DetailItem>
                    </div>

                    {pending ? (
                      <p className="mt-2.5 flex items-start gap-1.5 font-body-sm text-body-sm text-on-error-container">
                        <Icon name="info" className="mt-0.5 text-[16px]" />
                        Hay una actualización publicada de{" "}
                        {instalacion.versionInstalada} a {targetVersion}. Queda
                        pendiente de aplicar en este equipo.
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-surface-variant px-4 py-8 text-center">
              <Icon name="apps" className="text-[26px] text-secondary" />
              <span className="font-title-md text-body-sm text-on-surface">
                Este equipo no tiene software asignado
              </span>
              <span className="max-w-md font-body-sm text-body-sm text-secondary">
                Usa “Asignar software” para vincular el software con licencia de
                la empresa.
              </span>
            </div>
          )}
        </section>
      </div>
    </Modal>
  );
}
