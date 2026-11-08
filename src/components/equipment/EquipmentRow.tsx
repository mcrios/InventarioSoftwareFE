"use client";

import {
  getEquipmentHealthMeta,
  getEquipmentIcon,
} from "@/components/equipment/equipmentMeta";
import {
  collectLicensesInUse,
  getLicenseExpiryMeta,
  isInstallationOutdated,
} from "@/components/equipment/equipmentSoftware";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { formatDate } from "@/lib/format";
import type {
  Actualizacion,
  Equipo,
  EquipoSoftware,
} from "@/types/api";

interface EquipmentRowProps {
  equipo: Equipo;
  instalaciones: EquipoSoftware[];
  latestUpdates: Map<number, Actualizacion>;
  onView: (equipo: Equipo) => void;
  onEdit: (equipo: Equipo) => void;
  onDelete: (equipo: Equipo) => void;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "?";
}

export function EquipmentRow({
  equipo,
  instalaciones,
  latestUpdates,
  onView,
  onEdit,
  onDelete,
}: EquipmentRowProps) {
  const health = getEquipmentHealthMeta(equipo.salud);
  const responsable = equipo.responsable;
  const pendientes = instalaciones.filter((instalacion) =>
    isInstallationOutdated(instalacion, latestUpdates),
  ).length;
  const licenciasEnRiesgo = collectLicensesInUse(instalaciones).filter(
    (licencia) => {
      const state = getLicenseExpiryMeta(licencia.fechaVencimiento).state;
      return state === "expired" || state === "soon";
    },
  ).length;

  return (
    <tr className="group transition-colors hover:bg-surface-container-low">
      <td className="px-4 py-3.5">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-container text-on-surface shadow-sm">
            <Icon name={getEquipmentIcon(equipo.tipo)} className="text-[20px]" />
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-title-md text-body-sm text-on-surface">
              {equipo.nombre}
            </span>
            <span className="truncate font-label-mono-xs text-label-mono-xs text-secondary">
              {[equipo.fabricante, equipo.ubicacion]
                .filter(Boolean)
                .join(" · ") || "Sin fabricante ni ubicación"}
            </span>
          </div>
        </div>
      </td>

      <td className="px-4 py-3.5">
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-title-md text-body-sm text-on-surface">
            {equipo.empresa.nombre}
          </span>
          <span className="font-label-mono-xs text-label-mono-xs text-secondary">
            {equipo.empresa.identificador || `Empresa #${equipo.empresa.id}`}
          </span>
        </div>
      </td>

      <td className="px-4 py-3.5">
        <div className="flex flex-col items-start gap-1">
          <span className="rounded bg-surface-container px-2 py-0.5 font-label-mono-xs text-label-mono-xs text-on-surface">
            {equipo.tipo || "Sin tipo"}
          </span>
          <span className="flex items-center gap-1 font-code-md text-code-md text-secondary">
            <Icon name="lan" className="text-[13px]" />
            {equipo.ip || "Sin IP"}
          </span>
        </div>
      </td>

      <td className="px-4 py-3.5">
        {instalaciones.length ? (
          <div className="flex flex-col items-start gap-1">
            <span className="flex items-center gap-1 font-label-mono-xs text-label-mono-xs text-secondary">
              <Icon name="apps" className="text-[13px]" />
              {instalaciones.length} software
            </span>
            {pendientes ? (
              <Badge tone="warning">
                <Icon name="system_update_alt" className="text-[13px]" />
                {pendientes} por actualizar
              </Badge>
            ) : (
              <Badge tone="success">
                <Icon name="check_circle" className="text-[13px]" />
                Al día
              </Badge>
            )}
            {licenciasEnRiesgo ? (
              <span className="flex items-center gap-1 font-label-mono-xs text-label-mono-xs text-error">
                <Icon name="event_busy" className="text-[13px]" />
                {licenciasEnRiesgo} licencia
                {licenciasEnRiesgo === 1 ? "" : "s"} por vencer
              </span>
            ) : null}
          </div>
        ) : (
          <span className="flex items-center gap-1.5 font-body-sm text-body-sm text-secondary">
            <Icon name="apps" className="text-[16px]" />
            Sin software
          </span>
        )}
      </td>

      <td className="px-4 py-3.5">
        {responsable ? (
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-container-high font-label-mono-xs text-label-mono-xs font-bold text-on-surface">
              {getInitials(responsable.nombre)}
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-title-md text-body-sm text-on-surface">
                {responsable.nombre}
              </span>
              <span className="truncate font-label-mono-xs text-label-mono-xs text-secondary">
                {responsable.email}
              </span>
            </div>
          </div>
        ) : (
          <span className="flex items-center gap-1.5 font-body-sm text-body-sm text-secondary">
            <Icon name="person_off" className="text-[16px]" />
            Sin asignar
          </span>
        )}
      </td>

      <td className="px-4 py-3.5">
        <div className="flex flex-col items-start gap-1.5">
          <Badge tone={health.tone}>
            <Icon name={health.icon} className="text-[13px]" />
            {health.label}
          </Badge>
          <span className="font-label-mono-xs text-label-mono-xs text-secondary">
            Alta {formatDate(equipo.fechaCreacion)}
          </span>
        </div>
      </td>

      <td className="px-4 py-3.5 text-right">
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onView(equipo)}
            aria-label={`Ver ficha técnica de ${equipo.nombre}`}
            title="Ficha técnica"
          >
            <Icon name="visibility" className="text-[18px]" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(equipo)}
            aria-label={`Editar ${equipo.nombre}`}
            title="Editar equipo"
          >
            <Icon name="edit" className="text-[18px]" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(equipo)}
            aria-label={`Eliminar ${equipo.nombre}`}
            title="Eliminar equipo"
            className="text-error hover:bg-error-container"
          >
            <Icon name="delete" className="text-[18px]" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
