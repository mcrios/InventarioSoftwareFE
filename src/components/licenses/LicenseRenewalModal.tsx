"use client";

import { useState, type FormEvent } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { getLicenseStatusInfo } from "@/components/licenses/licenseStatus";
import { getErrorMessage } from "@/lib/utils";
import type { Licencia, LicenciaRenovacionInput } from "@/types/api";

interface LicenseRenewalModalProps {
  open: boolean;
  onClose: () => void;
  licencia: Licencia | null;
  onRenew: (id: number, current: Licencia, payload: LicenciaRenovacionInput) => Promise<void>;
}

function getInitialRenewal(licencia: Licencia | null) {
  if (!licencia) {
    return {
      fecha: "",
      total: 1,
      clave: "",
    };
  }

  const baseDate = licencia.fechaVencimiento
    ? new Date(licencia.fechaVencimiento)
    : new Date();

  const startFrom =
    baseDate.getTime() > Date.now() ? baseDate : new Date();

  const plusOneYear = new Date(startFrom);
  plusOneYear.setFullYear(plusOneYear.getFullYear() + 1);

  return {
    fecha: plusOneYear.toISOString().split("T")[0],
    total: licencia.cantidadTotal ?? 1,
    clave: licencia.codigoClave ?? "",
  };
}

export function LicenseRenewalModal({
  open,
  onClose,
  licencia,
  onRenew,
}: LicenseRenewalModalProps) {
  const initial = getInitialRenewal(licencia);

  const [nuevaFecha, setNuevaFecha] = useState(initial.fecha);
  const [nuevaCantidadTotal, setNuevaCantidadTotal] = useState<number>(initial.total);
  const [nuevaClave, setNuevaClave] = useState(initial.clave);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!licencia) return null;

  const statusInfo = getLicenseStatusInfo(licencia);

  function applyQuickExtension(months: number) {
    const baseDate = licencia?.fechaVencimiento
      ? new Date(licencia.fechaVencimiento)
      : new Date();

    const startFrom =
      baseDate.getTime() > Date.now() ? baseDate : new Date();

    const newDate = new Date(startFrom);
    newDate.setMonth(newDate.getMonth() + months);

    setNuevaFecha(newDate.toISOString().split("T")[0]);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!licencia) return;

    if (!nuevaFecha) {
      setError("Debes indicar una nueva fecha de vencimiento.");
      return;
    }

    if (nuevaCantidadTotal < (licencia.cantidadUsada ?? 0)) {
      setError(
        `La cantidad de instalaciones permitidas (${nuevaCantidadTotal}) no puede ser menor a las instalaciones actualmente en uso (${licencia.cantidadUsada}).`,
      );
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await onRenew(licencia.id, licencia, {
        fechaVencimiento: nuevaFecha,
        cantidadTotal: Number(nuevaCantidadTotal),
        codigoClave: nuevaClave.trim() || null,
      });
      onClose();
    } catch (renewError) {
      setError(getErrorMessage(renewError));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Renovar Licencia"
      description="Extiende la vigencia del contrato, amplía la cantidad de instalaciones permitidas o actualiza la clave de producto."
      size="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-error/10 p-3 text-body-sm text-error">
            <Icon name="error" className="shrink-0 text-[18px]" />
            <span>{error}</span>
          </div>
        )}

        {/* Ficha actual de la licencia */}
        <div className="rounded-2xl bg-surface-container-low p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/30 pb-3">
            <div>
              <span className="block font-label-mono-xs text-label-mono-xs text-secondary">
                EMPRESA
              </span>
              <span className="font-title-md text-body-md text-on-surface">
                {licencia.empresa?.nombre ?? "Sin empresa"}
              </span>
            </div>
            <Badge tone={statusInfo.badgeTone}>{statusInfo.statusLabel}</Badge>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-4 text-body-sm">
            <div>
              <span className="block text-secondary">Clave actual</span>
              <span className="font-label-mono-xs text-label-mono-xs text-on-surface">
                {licencia.codigoClave || "Sin clave registrada"}
              </span>
            </div>
            <div>
              <span className="block text-secondary">Vencimiento anterior</span>
              <span className="font-body-md text-on-surface">
                {statusInfo.formattedDate}
              </span>
            </div>
            <div>
              <span className="block text-secondary">Instalaciones en uso</span>
              <span className="font-body-md text-on-surface">
                {licencia.cantidadUsada ?? 0} asignadas
              </span>
            </div>
            <div>
              <span className="block text-secondary">Instalaciones permitidas</span>
              <span className="font-body-md text-on-surface">
                {licencia.cantidadTotal ?? 1} totales
              </span>
            </div>
          </div>
        </div>

        {/* Botones de extensión rápida */}
        <div>
          <label className="mb-2 block font-title-sm text-body-sm text-on-surface">
            Extensión rápida de vigencia
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyQuickExtension(6)}
              className="rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-1.5 font-label-mono-xs text-label-mono-xs text-on-surface hover:bg-surface-container"
            >
              +6 Meses
            </button>
            <button
              type="button"
              onClick={() => applyQuickExtension(12)}
              className="rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-1.5 font-label-mono-xs text-label-mono-xs text-on-surface hover:bg-surface-container"
            >
              +1 Año
            </button>
            <button
              type="button"
              onClick={() => applyQuickExtension(24)}
              className="rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-1.5 font-label-mono-xs text-label-mono-xs text-on-surface hover:bg-surface-container"
            >
              +2 Años
            </button>
          </div>
        </div>

        {/* Nueva Fecha de Vencimiento */}
        <Input
          id="renewal-date"
          label="Nueva fecha de vencimiento"
          type="date"
          value={nuevaFecha}
          onChange={(event) => setNuevaFecha(event.target.value)}
          required
          hint="Fecha hasta la cual será válida la licencia tras la renovación."
        />

        {/* Nueva Cantidad de Instalaciones Permitidas */}
        <Input
          id="renewal-installations"
          label="Cantidad de instalaciones permitidas"
          type="number"
          min={licencia.cantidadUsada ?? 1}
          value={String(nuevaCantidadTotal)}
          onChange={(event) =>
            setNuevaCantidadTotal(parseInt(event.target.value, 10) || 1)
          }
          required
          hint={`Actualmente hay ${licencia.cantidadUsada ?? 0} instalaciones en uso. Puedes aumentar este cupo si contrataron más equipos.`}
        />

        {/* Clave de producto renovada (opcional) */}
        <Input
          id="renewal-key"
          label="Nueva clave de producto (opcional)"
          type="text"
          value={nuevaClave}
          onChange={(event) => setNuevaClave(event.target.value)}
          placeholder="Mantener anterior o ingresar nueva..."
          hint="Si el proveedor te entregó una nueva clave al renovar, ingrésala aquí."
        />

        {/* Botones de acción */}
        <div className="mt-4 flex justify-end gap-2 border-t border-outline-variant/30 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? (
              <>
                <Icon name="progress_activity" className="animate-spin text-[18px]" />
                Renovando...
              </>
            ) : (
              "Confirmar Renovación"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
