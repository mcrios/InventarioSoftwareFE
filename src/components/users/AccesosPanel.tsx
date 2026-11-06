"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { securityService } from "@/lib/securityService";
import { getErrorMessage } from "@/lib/utils";
import type { Acceso, AccesoInput } from "@/types/api";

interface AccesosPanelProps {
  accesos: Acceso[];
  onRefresh: () => Promise<void>;
  notify: (message: string, tone?: "success" | "error") => void;
}

interface AccessFormState {
  codigo: string;
  modulo: string;
  descripcion: string;
  path: string;
}

const emptyForm: AccessFormState = {
  codigo: "",
  modulo: "",
  descripcion: "",
  path: "",
};

export function AccesosPanel({
  accesos,
  onRefresh,
  notify,
}: AccesosPanelProps) {
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Acceso | null>(null);
  const [form, setForm] = useState<AccessFormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting] = useState<Acceso | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);

  const filteredAccesses = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return accesos;

    return accesos.filter((access) =>
      [access.codigo, access.modulo, access.descripcion ?? "", access.path ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(value),
    );
  }, [accesos, query]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
    setFormOpen(true);
  }

  function openEdit(access: Acceso) {
    setEditing(access);
    setForm({
      codigo: access.codigo,
      modulo: access.modulo,
      descripcion: access.descripcion ?? "",
      path: access.path ?? "",
    });
    setFormError(null);
    setFormOpen(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setFormError(null);

    const payload: AccesoInput = {
      codigo: form.codigo.trim(),
      modulo: form.modulo.trim(),
      descripcion: form.descripcion.trim() || null,
      path: form.path.trim() || null,
    };

    try {
      if (editing) {
        await securityService.updateAcceso(editing.id, payload);
        notify("Acceso actualizado correctamente.");
      } else {
        await securityService.createAcceso(payload);
        notify("Acceso creado correctamente.");
      }

      setFormOpen(false);
      await onRefresh();
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleting) return;

    setDeletingBusy(true);
    try {
      await securityService.deleteAcceso(deleting.id);
      setDeleting(null);
      notify("Acceso eliminado correctamente.");
      await onRefresh();
    } catch (error) {
      setDeleting(null);
      notify(getErrorMessage(error), "error");
    } finally {
      setDeletingBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 items-center gap-2 rounded-xl bg-surface-container-lowest px-4 py-2 shadow-sm">
          <Icon name="search" className="text-[20px] text-secondary" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por código, módulo o ruta..."
            className="w-full bg-transparent font-body-md text-body-md text-on-surface placeholder:text-secondary focus:outline-none"
          />
        </div>

        <Button onClick={openCreate}>
          <Icon name="add" className="text-[18px]" />
          <span>Nuevo acceso</span>
        </Button>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container font-label-mono-xs text-label-mono-xs uppercase tracking-wider text-secondary">
                <th className="px-4 py-3 font-semibold">Código</th>
                <th className="px-4 py-3 font-semibold">Módulo</th>
                <th className="px-4 py-3 font-semibold">Descripción</th>
                <th className="px-4 py-3 font-semibold">Ruta</th>
                <th className="px-4 py-3 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container bg-surface-container-lowest">
              {filteredAccesses.length ? (
                filteredAccesses.map((access) => (
                  <tr
                    key={access.id}
                    className="transition-colors hover:bg-surface-container-low"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-container text-on-surface-variant">
                          <Icon name="key" className="text-[18px]" />
                        </div>
                        <div className="flex min-w-0 flex-col">
                          <span className="truncate font-code-md text-code-md text-on-surface">
                            {access.codigo}
                          </span>
                          <span className="font-label-mono-xs text-label-mono-xs text-secondary">
                            ID #{access.id}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="rounded-full bg-surface-container px-2.5 py-1 font-label-mono-xs text-label-mono-xs uppercase text-on-surface">
                        {access.modulo}
                      </span>
                    </td>
                    <td className="max-w-md px-4 py-3.5 font-body-sm text-body-sm text-secondary">
                      <span className="line-clamp-2">
                        {access.descripcion || "Sin descripción"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-code-md text-code-md text-secondary">
                      {access.path || "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Editar acceso ${access.codigo}`}
                          title="Editar acceso"
                          onClick={() => openEdit(access)}
                        >
                          <Icon name="edit" className="text-[18px]" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Eliminar acceso ${access.codigo}`}
                          title="Eliminar acceso"
                          className="text-error hover:bg-error-container"
                          onClick={() => setDeleting(access)}
                        >
                          <Icon name="delete" className="text-[18px]" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center font-body-md text-body-md text-secondary"
                  >
                    No se encontraron accesos con ese criterio.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 bg-surface-container-low p-4">
          <span className="font-label-mono-xs text-label-mono-xs text-secondary">
            Mostrando{" "}
            <strong className="text-on-surface">
              {filteredAccesses.length}
            </strong>{" "}
            de <strong className="text-on-surface">{accesos.length}</strong>{" "}
            accesos
          </span>
          <span className="flex items-center gap-1.5 font-label-mono-xs text-label-mono-xs text-secondary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-container" />
            Catálogo de permisos
          </span>
        </div>
      </Card>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Editar acceso" : "Nuevo acceso"}
        description="Define el permiso que podrá asignarse a los roles."
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setFormOpen(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button type="submit" form="access-form" disabled={saving}>
              <Icon
                name={saving ? "progress_activity" : "save"}
                className={saving ? "animate-spin text-[17px]" : "text-[17px]"}
              />
              <span>{saving ? "Guardando..." : "Guardar"}</span>
            </Button>
          </>
        }
      >
        <form
          id="access-form"
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          {formError ? (
            <div className="flex items-start gap-2 rounded-xl bg-error-container px-3 py-2.5 font-body-sm text-body-sm text-on-error-container">
              <Icon name="error" className="mt-0.5 text-[18px]" filled />
              <span>{formError}</span>
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Código"
              name="codigo"
              icon="key"
              value={form.codigo}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  codigo: event.target.value,
                }))
              }
              placeholder="Ej. USUARIOS_VER"
              required
            />
            <Input
              label="Módulo"
              name="modulo"
              icon="category"
              value={form.modulo}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  modulo: event.target.value,
                }))
              }
              placeholder="Ej. Usuarios"
              required
            />
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="font-label-mono-xs text-label-mono-xs uppercase tracking-wider text-secondary">
              Descripción
            </span>
            <textarea
              value={form.descripcion}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  descripcion: event.target.value,
                }))
              }
              rows={3}
              placeholder="Qué permite este acceso"
              className="w-full resize-none rounded-xl border border-surface-variant bg-surface-container-lowest px-4 py-2.5 text-body-md text-on-surface placeholder:text-secondary/80 focus:border-primary-container focus:outline-none focus:ring-2 focus:ring-primary-container/20"
            />
          </label>

          <Input
            label="Ruta (opcional)"
            name="path"
            icon="link"
            value={form.path}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                path: event.target.value,
              }))
            }
            placeholder="/users"
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Eliminar acceso"
        description={
          deleting
            ? `Se eliminará el acceso ${deleting.codigo} del catálogo.`
            : ""
        }
        loading={deletingBusy}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
