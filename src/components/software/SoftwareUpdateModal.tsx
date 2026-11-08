"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { getErrorMessage } from "@/lib/utils";
import type {
  ActualizacionInput,
  Software,
} from "@/types/api";

interface SoftwareUpdateModalProps {
  software: Software;
  onClose: () => void;
  onSubmit: (input: ActualizacionInput) => Promise<void>;
}

const CHANGE_TYPES = [
  { value: "Parche", label: "Parche", description: "Correcciones menores" },
  { value: "Seguridad", label: "Seguridad", description: "Vulnerabilidades" },
  { value: "Menor", label: "Versión menor", description: "Nuevas funciones" },
  { value: "Mayor", label: "Versión mayor", description: "Cambio importante" },
  { value: "Corrección", label: "Corrección", description: "Arreglo puntual" },
];

const textAreaClassName =
  "w-full resize-y rounded-xl border border-surface-variant bg-surface-container-lowest px-4 py-2.5 font-body-md text-body-md text-on-surface placeholder:text-secondary/80 focus:border-primary-container focus:outline-none focus:ring-2 focus:ring-primary-container/20";

export function SoftwareUpdateModal({
  software,
  onClose,
  onSubmit,
}: SoftwareUpdateModalProps) {
  const [versionOrigen, setVersionOrigen] = useState(software.versionActual);
  const [versionDestino, setVersionDestino] = useState("");
  const [tipoCambio, setTipoCambio] = useState("Parche");
  const [descripcion, setDescripcion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!versionOrigen.trim()) {
      setError("Indica la versión de origen.");
      return;
    }

    if (!versionDestino.trim()) {
      setError("Indica la versión destino de la actualización.");
      return;
    }

    if (versionOrigen.trim() === versionDestino.trim()) {
      setError("La versión destino debe ser distinta a la versión de origen.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await onSubmit({
        software: { id: software.id },
        versionOrigen: versionOrigen.trim(),
        versionDestino: versionDestino.trim(),
        tipoCambio,
        descripcion: descripcion.trim() || null,
      });
      onClose();
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="md"
      title="Publicar actualización"
      description={`${software.nombre} · ${software.licencia.empresa.nombre}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" form="software-update-form" disabled={saving}>
            <Icon
              name={saving ? "progress_activity" : "system_update_alt"}
              className={saving ? "animate-spin text-[17px]" : "text-[17px]"}
            />
            <span>{saving ? "Publicando..." : "Publicar actualización"}</span>
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
          La actualización quedará publicada en el catálogo. La versión actual
          del software no cambia hasta que el despliegue sea aprobado y
          ejecutado.
        </span>
      </div>

      <form
        id="software-update-form"
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Versión de origen"
            name="versionOrigen"
            icon="history"
            value={versionOrigen}
            onChange={(event) => setVersionOrigen(event.target.value)}
            placeholder="Ej. 1.4.2"
            required
          />

          <Input
            label="Versión destino"
            name="versionDestino"
            icon="upgrade"
            value={versionDestino}
            onChange={(event) => setVersionDestino(event.target.value)}
            placeholder="Ej. 1.5.0"
            required
          />
        </div>

        <Select
          label="Tipo de cambio"
          id="update-change-type"
          value={tipoCambio}
          onChange={setTipoCambio}
          options={CHANGE_TYPES}
          searchable={false}
          required
        />

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="update-descripcion"
            className="font-label-mono-xs text-label-mono-xs uppercase tracking-wider text-secondary"
          >
            Descripción del cambio
          </label>
          <textarea
            id="update-descripcion"
            value={descripcion}
            onChange={(event) => setDescripcion(event.target.value)}
            rows={4}
            placeholder="Detalla qué incluye esta actualización, riesgos o notas de despliegue..."
            className={textAreaClassName}
          />
        </div>
      </form>
    </Modal>
  );
}
