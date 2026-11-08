"use client";

import { useMemo, useState, type FormEvent } from "react";
import { getLicenseExpiryMeta } from "@/components/equipment/equipmentSoftware";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { getErrorMessage } from "@/lib/utils";
import type {
  Licencia,
  Software,
  SoftwareInput,
  TipoSoftware,
} from "@/types/api";

interface SoftwareFormModalProps {
  open: boolean;
  software: Software | null;
  licencias: Licencia[];
  tiposSoftware: TipoSoftware[];
  onClose: () => void;
  onSubmit: (input: SoftwareInput, id: number | null) => Promise<void>;
}

interface SoftwareFormState {
  nombre: string;
  fabricante: string;
  versionActual: string;
  licenciaId: string;
  tipoSoftwareId: string;
}

function buildFormState(
  software: Software | null,
  licencias: Licencia[],
  tiposSoftware: TipoSoftware[],
): SoftwareFormState {
  return {
    nombre: software?.nombre ?? "",
    fabricante: software?.fabricante ?? "",
    versionActual: software?.versionActual ?? "1.0.0",
    licenciaId: String(software?.licencia.id ?? licencias[0]?.id ?? ""),
    tipoSoftwareId: String(
      software?.tipoSoftware?.id ?? tiposSoftware[0]?.id ?? "",
    ),
  };
}

function nullable(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function SoftwareFormModal({
  open,
  software,
  licencias,
  tiposSoftware,
  onClose,
  onSubmit,
}: SoftwareFormModalProps) {
  const editing = Boolean(software);

  const [form, setForm] = useState<SoftwareFormState>(() =>
    buildFormState(software, licencias, tiposSoftware),
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const licenciaOptions = useMemo(() => {
    const options = licencias.map((licencia) => ({
      value: String(licencia.id),
      label: `Licencia #${licencia.id} · ${licencia.empresa.nombre}`,
      description: `${licencia.cantidadUsada}/${licencia.cantidadTotal} asientos${
        licencia.fechaVencimiento
          ? ` · vence ${licencia.fechaVencimiento}`
          : " · sin vencimiento"
      }`,
    }));

    if (
      software &&
      !licencias.some((licencia) => licencia.id === software.licencia.id)
    ) {
      options.unshift({
        value: String(software.licencia.id),
        label: `Licencia #${software.licencia.id} · ${software.licencia.empresa.nombre}`,
        description: "Licencia actualmente asociada",
      });
    }

    return options;
  }, [licencias, software]);

  const tipoOptions = useMemo(() => {
    const options = tiposSoftware.map((tipo) => ({
      value: String(tipo.id),
      label: tipo.nombre,
      description: tipo.descripcion ?? undefined,
    }));

    if (
      software?.tipoSoftware &&
      !tiposSoftware.some((tipo) => tipo.id === software.tipoSoftware.id)
    ) {
      options.unshift({
        value: String(software.tipoSoftware.id),
        label: software.tipoSoftware.nombre,
        description: software.tipoSoftware.descripcion ?? undefined,
      });
    }

    return options;
  }, [software, tiposSoftware]);

  const selectedLicencia = licenciaOptions.find(
    (option) => option.value === form.licenciaId,
  );
  const licencia = licencias.find(
    (item) => String(item.id) === form.licenciaId,
  );
  const expiry = getLicenseExpiryMeta(licencia?.fechaVencimiento);

  function updateField(field: keyof SoftwareFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.nombre.trim()) {
      setError("El nombre del software es obligatorio.");
      return;
    }

    if (!form.versionActual.trim()) {
      setError("Indica la versión actual del software.");
      return;
    }

    if (!form.licenciaId) {
      setError("Selecciona la licencia que respalda este software.");
      return;
    }

    if (!form.tipoSoftwareId) {
      setError("Selecciona el tipo de software.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await onSubmit(
        {
          nombre: form.nombre.trim(),
          fabricante: nullable(form.fabricante),
          versionActual: form.versionActual.trim(),
          licencia: { id: Number(form.licenciaId) },
          tipoSoftware: { id: Number(form.tipoSoftwareId) },
        },
        software?.id ?? null,
      );
      onClose();
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={editing ? "Editar software" : "Nuevo software"}
      description={
        editing
          ? "Actualiza los datos del registro sin alterar sus actualizaciones."
          : "Registra el software y vincúlalo a una licencia de las empresas asignadas a tu usuario."
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="software-form"
            disabled={saving || licenciaOptions.length === 0}
          >
            <Icon
              name={saving ? "progress_activity" : "save"}
              className={saving ? "animate-spin text-[17px]" : "text-[17px]"}
            />
            <span>
              {saving
                ? "Guardando..."
                : editing
                  ? "Guardar cambios"
                  : "Crear software"}
            </span>
          </Button>
        </>
      }
    >
      {error ? (
        <div className="mb-4 flex items-start gap-2 rounded-xl bg-error-container px-3 py-2.5 font-body-sm text-body-sm text-on-error-container">
          <Icon name="error" className="mt-0.5 text-[18px]" filled />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="mb-4 flex items-start gap-2 rounded-xl bg-surface-container-low px-3 py-2.5 font-body-sm text-body-sm text-secondary">
        <Icon name="info" className="mt-0.5 text-[18px]" />
        <span>
          Solo se muestran las licencias de las empresas asignadas a tu usuario
          en sesión. Si necesitas otra licencia, solicita acceso a esa empresa.
        </span>
      </div>

      {licenciaOptions.length === 0 ? (
        <div className="mb-4 flex flex-col items-center gap-2 rounded-xl border border-dashed border-surface-variant px-4 py-6 text-center">
          <Icon name="key_off" className="text-[26px] text-secondary" />
          <span className="font-title-md text-body-sm text-on-surface">
            No tienes licencias disponibles
          </span>
          <span className="max-w-md font-body-sm text-body-sm text-secondary">
            Tu usuario no tiene empresas con licencias registradas. Pide al
            administrador que asigne una empresa o registra la licencia primero.
          </span>
        </div>
      ) : null}

      <form
        id="software-form"
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Nombre del software"
            name="nombre"
            icon="apps"
            value={form.nombre}
            onChange={(event) => updateField("nombre", event.target.value)}
            placeholder="Ej. Microsoft 365"
            required
          />

          <Input
            label="Versión actual"
            name="versionActual"
            icon="tag"
            value={form.versionActual}
            onChange={(event) =>
              updateField("versionActual", event.target.value)
            }
            placeholder="Ej. 1.4.2"
            hint="Versión vigente del catálogo."
            required
          />

          <Input
            label="Fabricante"
            name="fabricante"
            icon="factory"
            value={form.fabricante}
            onChange={(event) => updateField("fabricante", event.target.value)}
            placeholder="Ej. Microsoft, Adobe, Atlassian"
            containerClassName="sm:col-span-2"
          />
        </div>

        <Select
          label="Licencia"
          id="software-licencia"
          value={form.licenciaId}
          onChange={(value) => updateField("licenciaId", value)}
          options={licenciaOptions}
          placeholder="Selecciona una licencia"
          searchPlaceholder="Buscar por empresa o número de licencia..."
          emptyMessage="No hay licencias que coincidan"
          disabled={licenciaOptions.length === 0}
          required
        />

        {licencia && selectedLicencia ? (
          <div className="flex flex-wrap items-center gap-2 rounded-xl bg-surface-container-low px-3 py-2.5">
            <span className="flex items-center gap-1.5 font-label-mono-xs text-label-mono-xs text-secondary">
              <Icon name="apartment" className="text-[15px]" />
              {licencia.empresa.nombre}
            </span>
            <span className="font-label-mono-xs text-label-mono-xs text-secondary">
              {licencia.cantidadUsada}/{licencia.cantidadTotal} asientos
            </span>
            <Badge tone={expiry.tone}>
              <Icon name={expiry.icon} className="text-[13px]" />
              {expiry.label}
            </Badge>
          </div>
        ) : null}

        <Select
          label="Tipo de software"
          id="software-tipo"
          value={form.tipoSoftwareId}
          onChange={(value) => updateField("tipoSoftwareId", value)}
          options={tipoOptions}
          placeholder="Selecciona un tipo"
          searchPlaceholder="Buscar tipo de software..."
          searchable={tipoOptions.length > 6}
          emptyMessage="No hay tipos que coincidan"
          required
        />
      </form>
    </Modal>
  );
}
