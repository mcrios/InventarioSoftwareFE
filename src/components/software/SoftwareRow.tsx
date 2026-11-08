"use client";

import { getApprovalStatusMeta } from "@/components/approvals/approvalStatus";
import { compareVersions } from "@/components/equipment/equipmentSoftware";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type {
  Actualizacion,
  Software,
  SolicitudActualizacion,
} from "@/types/api";

interface SoftwareRowProps {
  software: Software;
  updates: Actualizacion[];
  latestUpdate: Actualizacion | null;
  solicitud: SolicitudActualizacion | null;
  onEdit: (software: Software) => void;
  onCreateUpdate: (software: Software) => void;
  onRequestDeployment: (software: Software) => void;
}

export function SoftwareRow({
  software,
  updates,
  latestUpdate,
  solicitud,
  onEdit,
  onCreateUpdate,
  onRequestDeployment,
}: SoftwareRowProps) {
  const licencia = software.licencia;
  const pending = latestUpdate
    ? compareVersions(software.versionActual, latestUpdate.versionDestino) < 0
    : false;
  const status = solicitud ? getApprovalStatusMeta(solicitud.estado) : null;

  return (
    <tr className="group transition-colors hover:bg-surface-container-low">
      <td className="px-4 py-3.5">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-container text-on-surface shadow-sm">
            <Icon name="apps" className="text-[20px]" />
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            <span className="truncate font-title-md text-body-sm text-on-surface">
              {software.nombre}
            </span>
            <span className="truncate font-label-mono-xs text-label-mono-xs text-secondary">
              {[software.fabricante, software.tipoSoftware?.nombre]
                .filter(Boolean)
                .join(" · ") || "Sin fabricante ni tipo"}
            </span>
          </div>
        </div>
      </td>

      <td className="px-4 py-3.5">
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-title-md text-body-sm text-on-surface">
            {licencia.empresa.nombre}
          </span>
          <span className="font-label-mono-xs text-label-mono-xs text-secondary">
            Licencia #{licencia.id} · {licencia.cantidadUsada}/
            {licencia.cantidadTotal} asientos
          </span>
        </div>
      </td>

      <td className="px-4 py-3.5">
        <div className="flex flex-col items-start gap-1">
          <span className="flex items-center gap-1.5 font-code-md text-code-md text-on-surface">
            {software.versionActual}
            {pending && latestUpdate ? (
              <>
                <Icon
                  name="arrow_forward"
                  className="text-[14px] text-secondary"
                />
                <span className="font-semibold text-error">
                  {latestUpdate.versionDestino}
                </span>
              </>
            ) : null}
          </span>
          <Badge
            tone={
              latestUpdate ? (pending ? "warning" : "success") : "neutral"
            }
          >
            <Icon
              name={
                latestUpdate
                  ? pending
                    ? "system_update_alt"
                    : "check_circle"
                  : "remove_circle"
              }
              className="text-[13px]"
            />
            {latestUpdate
              ? pending
                ? "Actualización publicada"
                : "Al día"
              : "Sin actualizaciones"}
          </Badge>
        </div>
      </td>

      <td className="px-4 py-3.5">
        <div className="flex flex-col gap-1">
          <span className="font-title-md text-body-sm text-on-surface">
            {updates.length} publicada{updates.length === 1 ? "" : "s"}
          </span>
          {latestUpdate ? (
            <span className="font-label-mono-xs text-label-mono-xs text-secondary">
              Última v{latestUpdate.versionDestino} ·{" "}
              {formatDate(latestUpdate.fechaLanzamiento)}
            </span>
          ) : (
            <span className="font-label-mono-xs text-label-mono-xs text-secondary">
              Publica la primera actualización
            </span>
          )}
        </div>
      </td>

      <td className="px-4 py-3.5">
        {status && solicitud ? (
          <div className="flex flex-col items-start gap-1">
            <Badge tone={status.tone}>
              <Icon name={status.icon} className="text-[13px]" />
              {status.label}
            </Badge>
            <span className="font-label-mono-xs text-label-mono-xs text-secondary">
              Solicitud #{solicitud.id}
            </span>
          </div>
        ) : (
          <span className="flex items-center gap-1.5 font-body-sm text-body-sm text-secondary">
            <Icon name="outbox" className="text-[16px]" />
            Sin solicitud
          </span>
        )}
      </td>

      <td className="px-4 py-3.5">
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(software)}
            aria-label={`Editar ${software.nombre}`}
            title="Editar software"
          >
            <Icon name="edit" className="text-[18px]" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onCreateUpdate(software)}
            aria-label={`Publicar actualización de ${software.nombre}`}
            title="Publicar actualización"
          >
            <Icon name="system_update_alt" className="text-[18px]" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRequestDeployment(software)}
            disabled={!latestUpdate}
            title={
              latestUpdate
                ? "Solicitar despliegue"
                : "Publica una actualización antes de solicitar el despliegue"
            }
            className={cn(!latestUpdate && "pointer-events-none opacity-40")}
          >
            <Icon name="rocket_launch" className="text-[16px]" />
            <span>Desplegar</span>
          </Button>
        </div>
      </td>
    </tr>
  );
}
