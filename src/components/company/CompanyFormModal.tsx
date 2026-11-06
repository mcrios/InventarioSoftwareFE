"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { getErrorMessage } from "@/lib/utils";
import type { EmpresaInput } from "@/types/api";

interface CompanyFormModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (input: EmpresaInput) => Promise<void>;
}

interface CompanyFormState {
  nombre: string;
  identificador: string;
  activo: boolean;
}

const emptyForm: CompanyFormState = {
  nombre: "",
  identificador: "",
  activo: true,
};

export function CompanyFormModal({
  open,
  onClose,
  onCreate,
}: CompanyFormModalProps) {
  const [form, setForm] = useState<CompanyFormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nombre = form.nombre.trim();

    if (!nombre) {
      setError("El nombre de la empresa es obligatorio.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await onCreate({
        nombre,
        identificador: form.identificador.trim() || null,
        activo: form.activo,
      });
      onClose();
    } catch (createError) {
      setError(getErrorMessage(createError));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nueva empresa"
      description="Registra una empresa para asociarle usuarios, licencias y equipos."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" form="company-form" disabled={saving}>
            <Icon
              name={saving ? "progress_activity" : "add_business"}
              className={saving ? "animate-spin text-[17px]" : "text-[17px]"}
            />
            <span>{saving ? "Guardando..." : "Crear empresa"}</span>
          </Button>
        </>
      }
    >
      <form
        id="company-form"
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
      >
        {error ? (
          <div className="flex items-start gap-2 rounded-xl bg-error-container px-3 py-2.5 font-body-sm text-body-sm text-on-error-container">
            <Icon name="error" className="mt-0.5 text-[18px]" filled />
            <span>{error}</span>
          </div>
        ) : null}

        <Input
          label="Nombre de la empresa"
          name="nombre"
          icon="corporate_fare"
          value={form.nombre}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              nombre: event.target.value,
            }))
          }
          placeholder="Ej. Acme Corporation"
          hint="Este nombre se mostrará en licencias, equipos y reportes."
          required
        />

        <Input
          label="Identificador"
          name="identificador"
          icon="fingerprint"
          value={form.identificador}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              identificador: event.target.value,
            }))
          }
          placeholder="Ej. ACME-SV"
          hint="Opcional. Código interno o NIT para identificar la empresa."
        />

        <label className="flex items-center gap-2 rounded-xl bg-surface-container-low px-3 py-2.5 font-body-sm text-body-sm text-on-surface">
          <input
            type="checkbox"
            checked={form.activo}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                activo: event.target.checked,
              }))
            }
            className="h-4 w-4 rounded accent-primary-container"
          />
          Empresa activa (disponible para asignaciones)
        </label>
      </form>
    </Modal>
  );
}
