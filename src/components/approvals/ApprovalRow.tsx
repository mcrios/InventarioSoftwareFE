"use client";

import { getApprovalStatusMeta } from "@/components/approvals/approvalStatus";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { isPendingApproval } from "@/lib/approvalService";
import { formatDateTime } from "@/lib/format";
import type { SolicitudActualizacion } from "@/types/api";

interface ApprovalRowProps {
  solicitud: SolicitudActualizacion;
  onReview: (solicitud: SolicitudActualizacion) => void;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "?";
}

export function ApprovalRow({ solicitud, onReview }: ApprovalRowProps) {
  const status = getApprovalStatusMeta(solicitud.estado);
  const pending = isPendingApproval(solicitud);
  const software = solicitud.actualizacion.software;
  const versionOrigen =
    solicitud.actualizacion.versionOrigen || software.versionActual;
  const solicitante = solicitud.solicitante;

  return (
    <tr className="group transition-colors hover:bg-surface-container-low">
      <td className="px-4 py-3.5">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-container text-on-surface shadow-sm">
            <Icon name="corporate_fare" className="text-[20px]" />
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-title-md text-body-sm text-on-surface">
              {solicitud.empresa.nombre}
            </span>
            <span className="font-label-mono-xs text-label-mono-xs text-secondary">
              {solicitud.empresa.identificador || `Empresa #${solicitud.empresa.id}`}
            </span>
          </div>
        </div>
      </td>

      <td className="px-4 py-3.5">
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-title-md text-body-sm text-on-surface">
              {software.nombre}
            </span>
            <span className="rounded bg-surface-container px-2 py-0.5 font-label-mono-xs text-label-mono-xs text-secondary">
              {solicitud.actualizacion.tipoCambio}
            </span>
          </div>
          <div className="flex items-center gap-1.5 font-code-md text-code-md">
            <span className="text-secondary">{versionOrigen}</span>
            <Icon name="arrow_forward" className="text-[14px] text-secondary" />
            <span className="font-semibold text-primary-container">
              {solicitud.actualizacion.versionDestino}
            </span>
          </div>
          {software.fabricante ? (
            <span className="font-label-mono-xs text-label-mono-xs text-secondary">
              {software.fabricante}
            </span>
          ) : null}
        </div>
      </td>

      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-container-high font-label-mono-xs text-label-mono-xs font-bold text-on-surface">
            {getInitials(solicitante.nombre)}
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-title-md text-body-sm text-on-surface">
              {solicitante.nombre}
            </span>
            <span className="font-label-mono-xs text-label-mono-xs text-secondary">
              {solicitante.roles[0]?.nombre || "Solicitante"}
            </span>
          </div>
        </div>
      </td>

      <td className="px-4 py-3.5">
        <div className="flex flex-col">
          <span className="font-body-sm text-body-sm text-on-surface">
            {formatDateTime(solicitud.fechaInicioRango)}
          </span>
          <span className="font-label-mono-xs text-label-mono-xs text-secondary">
            Hasta {formatDateTime(solicitud.fechaFinRango)}
          </span>
        </div>
      </td>

      <td className="px-4 py-3.5">
        <div className="flex flex-col items-start gap-1.5">
          <Badge tone={status.tone}>
            <Icon name={status.icon} className="text-[13px]" />
            {status.label}
          </Badge>
          {solicitud.aprobador ? (
            <span className="font-label-mono-xs text-label-mono-xs text-secondary">
              Por {solicitud.aprobador.nombre}
            </span>
          ) : null}
        </div>
      </td>

      <td className="px-4 py-3.5 text-right">
        <Button
          variant={pending ? "primary" : "ghost"}
          size="sm"
          onClick={() => onReview(solicitud)}
          aria-label={
            pending
              ? `Revisar solicitud de ${solicitud.empresa.nombre}`
              : `Ver detalle de la solicitud de ${solicitud.empresa.nombre}`
          }
        >
          <Icon
            name={pending ? "fact_check" : "visibility"}
            className="text-[16px]"
          />
          <span>{pending ? "Revisar" : "Ver detalle"}</span>
        </Button>
      </td>
    </tr>
  );
}
