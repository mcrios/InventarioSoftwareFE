"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { getLicenseStatusInfo } from "@/components/licenses/licenseStatus";
import { cn } from "@/lib/utils";
import type { Licencia } from "@/types/api";

interface LicenseRowProps {
  licencia: Licencia;
  onEdit: (licencia: Licencia) => void;
  onRenew: (licencia: Licencia) => void;
  onDelete: (licencia: Licencia) => void;
}

export function LicenseRow({
  licencia,
  onEdit,
  onRenew,
  onDelete,
}: LicenseRowProps) {
  const [copied, setCopied] = useState(false);

  const statusInfo = getLicenseStatusInfo(licencia);

  function handleCopy() {
    if (!licencia.codigoClave) return;
    navigator.clipboard.writeText(licencia.codigoClave).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <tr className="border-b border-outline-variant/30 transition-colors hover:bg-surface-container-low/50">
      {/* Clave / Código */}
      <td className="px-4 py-3.5 align-middle">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <span className="font-label-mono-sm text-body-sm font-semibold text-on-surface">
              {licencia.codigoClave || "Sin clave especificada"}
            </span>
            {licencia.codigoClave && (
              <button
                type="button"
                onClick={handleCopy}
                title={copied ? "Copiado al portapapeles" : "Copiar clave"}
                className="rounded p-1 text-secondary transition-colors hover:bg-surface-container hover:text-on-surface"
              >
                <Icon
                  name={copied ? "check" : "content_copy"}
                  className={cn("text-[15px]", copied && "text-primary")}
                />
              </button>
            )}
          </div>
          {licencia.archivoUrl && (
            <a
              href={licencia.archivoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-label-mono-xs text-label-mono-xs text-primary-container hover:underline"
            >
              <Icon name="attachment" className="text-[13px]" />
              Ver certificado / contrato
            </a>
          )}
        </div>
      </td>

      {/* Empresa */}
      <td className="px-4 py-3.5 align-middle">
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface-container px-2.5 py-1 font-title-sm text-body-sm text-on-surface">
          <Icon name="corporate_fare" className="text-[16px] text-secondary" />
          {licencia.empresa?.nombre ?? "Empresa no asignada"}
        </span>
      </td>

      {/* Cantidad de instalaciones */}
      <td className="px-4 py-3.5 align-middle">
        <div className="w-52">
          <div className="flex items-center justify-between font-label-mono-xs text-label-mono-xs">
            <span className="font-semibold text-on-surface">
              {licencia.cantidadUsada ?? 0} / {licencia.cantidadTotal ?? 1}
            </span>
            <span className="text-secondary">
              {statusInfo.availableInstallations} disponibles
            </span>
          </div>

          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-surface-container">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300",
                statusInfo.isExhausted
                  ? "bg-error"
                  : statusInfo.usagePercent > 85
                    ? "bg-secondary-container"
                    : "bg-primary-container",
              )}
              style={{ width: `${statusInfo.usagePercent}%` }}
            />
          </div>
          <span className="mt-0.5 block font-label-mono-xs text-[11px] text-secondary">
            {statusInfo.usagePercent}% de capacidad utilizada
          </span>
        </div>
      </td>

      {/* Estado y Vencimiento */}
      <td className="px-4 py-3.5 align-middle">
        <div className="flex flex-col items-start gap-1">
          <Badge tone={statusInfo.badgeTone}>{statusInfo.statusLabel}</Badge>
          <span className="font-label-mono-xs text-label-mono-xs text-secondary">
            {statusInfo.formattedDate}
          </span>
        </div>
      </td>

      {/* Acciones */}
      <td className="px-4 py-3.5 text-right align-middle">
        <div className="flex items-center justify-end gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onRenew(licencia)}
            title="Renovar vigencia o ampliar instalaciones"
            className="gap-1.5 font-title-sm text-primary-container"
          >
            <Icon name="autorenew" className="text-[16px]" />
            Renovar
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onEdit(licencia)}
            title="Editar licencia"
            aria-label="Editar licencia"
          >
            <Icon name="edit" className="text-[18px]" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onDelete(licencia)}
            title="Eliminar licencia"
            aria-label="Eliminar licencia"
            className="text-error hover:bg-error/10 hover:text-error"
          >
            <Icon name="delete" className="text-[18px]" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

