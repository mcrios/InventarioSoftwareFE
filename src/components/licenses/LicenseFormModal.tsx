"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { getErrorMessage } from "@/lib/utils";
import type { Empresa, Licencia, LicenciaInput } from "@/types/api";

interface LicenseFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: LicenciaInput) => Promise<void>;
  empresas: Empresa[];
  initialData?: Licencia | null;
}

interface FormState {
  empresaId: string;
  codigoClave: string;
  cantidadTotal: number;
  cantidadUsada: number;
  fechaVencimiento: string;
  archivoUrl: string;
  esPerpetua: boolean;
}

function getInitialForm(
  initialData?: Licencia | null,
  empresas: Empresa[] = [],
): FormState {
  if (initialData) {
    return {
      empresaId: String(initialData.empresa?.id ?? ""),
      codigoClave: initialData.codigoClave ?? "",
      cantidadTotal: initialData.cantidadTotal ?? 1,
      cantidadUsada: initialData.cantidadUsada ?? 0,
      fechaVencimiento: initialData.fechaVencimiento ?? "",
      archivoUrl: initialData.archivoUrl ?? "",
      esPerpetua: !initialData.fechaVencimiento,
    };
  }
  return {
    empresaId: empresas.length > 0 ? String(empresas[0].id) : "",
    codigoClave: "",
    cantidadTotal: 1,
    cantidadUsada: 0,
    fechaVencimiento: "",
    archivoUrl: "",
    esPerpetua: false,
  };
}

export function LicenseFormModal({
  open,
  onClose,
  onSubmit,
  empresas,
  initialData,
}: LicenseFormModalProps) {
  const isEditing = Boolean(initialData);

  const [form, setForm] = useState<FormState>(() =>
    getInitialForm(initialData, empresas),
  );

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.empresaId) {
      setError("Debes seleccionar una empresa para asociar la licencia.");
      return;
    }

    if (form.cantidadTotal < 1) {
      setError("La cantidad de instalaciones permitidas debe ser al menos 1.");
      return;
    }

    if (isEditing && form.cantidadTotal < form.cantidadUsada) {
      setError(
        `La cantidad de instalaciones permitidas (${form.cantidadTotal}) no puede ser menor a las instalaciones actualmente en uso (${form.cantidadUsada}).`,
      );
      return;
    }

    if (!form.esPerpetua && !form.fechaVencimiento) {
      setError(
        "Ingresa una fecha de vencimiento o marca la casilla de licencia perpetua.",
      );
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await onSubmit({
        empresa: { id: parseInt(form.empresaId, 10) },
        codigoClave: form.codigoClave.trim() || null,
        cantidadTotal: Number(form.cantidadTotal),
        cantidadUsada: isEditing ? Number(form.cantidadUsada) : 0,
        fechaVencimiento: form.esPerpetua ? null : form.fechaVencimiento || null,
        archivoUrl: form.archivoUrl.trim() || null,
      });
      onClose();
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Editar Licencia" : "Nueva Licencia"}
      description={
        isEditing
          ? "Actualiza los datos, empresa o instalaciones permitidas de esta licencia."
          : "Registra una nueva licencia vinculada a una empresa para luego poder asociarle software."
      }
      size="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-error/10 p-3 text-body-sm text-error">
            <Icon name="error" className="shrink-0 text-[18px]" />
            <span>{error}</span>
          </div>
        )}

        {/* Empresa */}
        <div>
          <label
            htmlFor="license-empresa"
            className="mb-1.5 block font-title-sm text-body-sm text-on-surface"
          >
            Empresa <span className="text-error">*</span>
          </label>
          <select
            id="license-empresa"
            value={form.empresaId}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, empresaId: event.target.value }))
            }
            required
            className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-3.5 py-2.5 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="" disabled>
              Selecciona una empresa...
            </option>
            {empresas.map((emp) => (
              <option key={emp.id} value={String(emp.id)}>
                {emp.nombre}
              </option>
            ))}
          </select>
          {empresas.length === 0 && (
            <p className="mt-1 font-body-sm text-error">
              No hay empresas registradas. Primero debes registrar una empresa en el módulo de Empresas.
            </p>
          )}
        </div>

        {/* Código o Clave de Activación */}
        <Input
          id="license-key"
          label="Clave / Código de activación"
          type="text"
          value={form.codigoClave}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, codigoClave: event.target.value }))
          }
          placeholder="Ej: XXXX-XXXX-XXXX-XXXX o ID de contrato"
          hint="Identificador o clave de producto para activar el software."
        />

        {/* Cantidad de instalaciones permitidas */}
        <div>
          <Input
            id="license-quantity"
            label="Cantidad de instalaciones permitidas"
            type="number"
            min={1}
            value={String(form.cantidadTotal)}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                cantidadTotal: parseInt(event.target.value, 10) || 1,
              }))
            }
            required
            hint={
              isEditing
                ? `Actualmente hay ${form.cantidadUsada} instalaciones en uso.`
                : "Número máximo de equipos donde se puede instalar el software bajo esta licencia."
            }
          />
        </div>

        {/* Licencia perpetua toggle */}
        <div className="flex items-center gap-2 pt-1">
          <input
            id="license-perpetual"
            type="checkbox"
            checked={form.esPerpetua}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                esPerpetua: event.target.checked,
                fechaVencimiento: event.target.checked ? "" : prev.fechaVencimiento,
              }))
            }
            className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
          />
          <label
            htmlFor="license-perpetual"
            className="font-body-sm text-body-sm text-on-surface"
          >
            Licencia perpetua (sin fecha de vencimiento)
          </label>
        </div>

        {/* Fecha de Vencimiento */}
        {!form.esPerpetua && (
          <Input
            id="license-expiration"
            label="Fecha de vencimiento"
            type="date"
            value={form.fechaVencimiento}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                fechaVencimiento: event.target.value,
              }))
            }
            required={!form.esPerpetua}
            hint="Fecha límite en la que expira el soporte o validez de la licencia."
          />
        )}

        {/* URL o Documento de Soporte */}
        <Input
          id="license-file"
          label="Enlace a certificado o contrato (opcional)"
          type="url"
          value={form.archivoUrl}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, archivoUrl: event.target.value }))
          }
          placeholder="https://..."
          hint="Enlace al PDF o repositorio donde se custodia el contrato o factura."
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
          <Button
            type="submit"
            variant="primary"
            disabled={saving || (empresas.length === 0 && !isEditing)}
          >
            {saving ? (
              <>
                <Icon name="progress_activity" className="animate-spin text-[18px]" />
                Guardando...
              </>
            ) : isEditing ? (
              "Guardar Cambios"
            ) : (
              "Registrar Licencia"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
