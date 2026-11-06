"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { formatDate } from "@/lib/format";
import { securityService } from "@/lib/securityService";
import { cn, getErrorMessage } from "@/lib/utils";
import type { Acceso, Rol, RolInput, Usuario } from "@/types/api";

interface RolesPanelProps {
  roles: Rol[];
  accesos: Acceso[];
  usuarios: Usuario[];
  onRefresh: () => Promise<void>;
  notify: (message: string, tone?: "success" | "error") => void;
}

interface RoleFormState {
  nombre: string;
  descripcion: string;
}

const emptyForm: RoleFormState = {
  nombre: "",
  descripcion: "",
};

export function RolesPanel({
  roles,
  accesos,
  usuarios,
  onRefresh,
  notify,
}: RolesPanelProps) {
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Rol | null>(null);
  const [form, setForm] = useState<RoleFormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [accessFor, setAccessFor] = useState<Rol | null>(null);
  const [selectedAccessIds, setSelectedAccessIds] = useState<number[]>([]);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [savingAccess, setSavingAccess] = useState(false);

  const [deleting, setDeleting] = useState<Rol | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);

  const usersByRole = useMemo(() => {
    const counts = new Map<number, number>();

    usuarios.forEach((user) => {
      user.roles.forEach((role) => {
        counts.set(role.id, (counts.get(role.id) ?? 0) + 1);
      });
    });

    return counts;
  }, [usuarios]);

  const groupedAccesses = useMemo(() => {
    return accesos.reduce<Record<string, Acceso[]>>((groups, access) => {
      const moduleAccesses = groups[access.modulo] ?? [];
      moduleAccesses.push(access);
      groups[access.modulo] = moduleAccesses;
      return groups;
    }, {});
  }, [accesos]);

  const filteredRoles = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return roles;

    return roles.filter((role) =>
      [
        role.nombre,
        role.descripcion ?? "",
        ...role.accesos.map((access) => `${access.codigo} ${access.modulo}`),
      ]
        .join(" ")
        .toLowerCase()
        .includes(value),
    );
  }, [query, roles]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
    setFormOpen(true);
  }

  function openEdit(role: Rol) {
    setEditing(role);
    setForm({
      nombre: role.nombre,
      descripcion: role.descripcion ?? "",
    });
    setFormError(null);
    setFormOpen(true);
  }

  function openAccessAssignment(role: Rol) {
    setAccessFor(role);
    setSelectedAccessIds(role.accesos.map((access) => access.id));
    setAccessError(null);
  }

  function toggleAccess(id: number) {
    setSelectedAccessIds((current) =>
      current.includes(id)
        ? current.filter((accessId) => accessId !== id)
        : [...current, id],
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setFormError(null);

    const payload: RolInput = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim() || null,
      accesos:
        editing?.accesos.map((access) => ({ id: access.id })) ?? [],
    };

    try {
      if (editing) {
        await securityService.updateRol(editing.id, payload);
        notify("Rol actualizado correctamente.");
      } else {
        await securityService.createRol(payload);
        notify("Rol creado correctamente.");
      }

      setFormOpen(false);
      await onRefresh();
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveAccesses() {
    if (!accessFor) return;

    setSavingAccess(true);
    setAccessError(null);

    const payload: RolInput = {
      nombre: accessFor.nombre,
      descripcion: accessFor.descripcion,
      accesos: selectedAccessIds.map((id) => ({ id })),
    };

    try {
      await securityService.updateRol(accessFor.id, payload);
      setAccessFor(null);
      notify("Accesos del rol actualizados.");
      await onRefresh();
    } catch (error) {
      setAccessError(getErrorMessage(error));
    } finally {
      setSavingAccess(false);
    }
  }

  async function handleDelete() {
    if (!deleting) return;

    setDeletingBusy(true);
    try {
      await securityService.deleteRol(deleting.id);
      setDeleting(null);
      notify("Rol eliminado correctamente.");
      await onRefresh();
    } catch (error) {
      setDeleting(null);
      notify(getErrorMessage(error), "error");
    } finally {
      setDeletingBusy(false);
    }
  }

  function toggleModule(moduleAccesses: Acceso[], checked: boolean) {
    const ids = moduleAccesses.map((access) => access.id);

    setSelectedAccessIds((current) => {
      if (checked) {
        return Array.from(new Set([...current, ...ids]));
      }

      return current.filter((id) => !ids.includes(id));
    });
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
            placeholder="Buscar por rol, descripción o acceso..."
            className="w-full bg-transparent font-body-md text-body-md text-on-surface placeholder:text-secondary focus:outline-none"
          />
        </div>

        <Button onClick={openCreate}>
          <Icon name="add_moderator" className="text-[18px]" />
          <span>Nuevo rol</span>
        </Button>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container font-label-mono-xs text-label-mono-xs uppercase tracking-wider text-secondary">
                <th className="px-4 py-3 font-semibold">Rol</th>
                <th className="px-4 py-3 font-semibold">Descripción</th>
                <th className="px-4 py-3 font-semibold">Accesos</th>
                <th className="px-4 py-3 font-semibold">Usuarios</th>
                <th className="px-4 py-3 font-semibold">Creado</th>
                <th className="px-4 py-3 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container bg-surface-container-lowest">
              {filteredRoles.length ? (
                filteredRoles.map((role) => (
                  <tr
                    key={role.id}
                    className="transition-colors hover:bg-surface-container-low"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-dark text-on-dark">
                          <Icon name="shield_person" className="text-[18px]" />
                        </div>
                        <div className="flex min-w-0 flex-col">
                          <span className="truncate font-title-md text-body-sm text-on-surface">
                            {role.nombre}
                          </span>
                          <span className="font-label-mono-xs text-label-mono-xs text-secondary">
                            ID #{role.id}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="max-w-sm px-4 py-3.5 font-body-sm text-body-sm text-secondary">
                      <span className="line-clamp-2">
                        {role.descripcion || "Sin descripción"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {role.accesos.slice(0, 2).map((access) => (
                          <span
                            key={access.id}
                            className="rounded bg-surface-container px-2 py-0.5 font-label-mono-xs text-label-mono-xs text-on-surface"
                          >
                            {access.codigo}
                          </span>
                        ))}
                        {role.accesos.length > 2 ? (
                          <span className="rounded bg-dark px-2 py-0.5 font-label-mono-xs text-label-mono-xs text-on-dark">
                            +{role.accesos.length - 2}
                          </span>
                        ) : null}
                        {!role.accesos.length ? (
                          <span className="font-body-sm text-body-sm text-secondary">
                            Sin accesos
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="flex w-fit items-center gap-1.5 rounded-full bg-surface-container px-2.5 py-1 font-label-mono-xs text-label-mono-xs text-on-surface">
                        <Icon name="group" className="text-[15px]" />
                        {usersByRole.get(role.id) ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-body-sm text-body-sm text-secondary">
                      {formatDate(role.fechaCreacion)}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Editar rol ${role.nombre}`}
                          title="Editar rol"
                          onClick={() => openEdit(role)}
                        >
                          <Icon name="edit" className="text-[18px]" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Asignar accesos a ${role.nombre}`}
                          title="Asignar accesos"
                          onClick={() => openAccessAssignment(role)}
                        >
                          <Icon name="key" className="text-[18px]" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Eliminar rol ${role.nombre}`}
                          title="Eliminar rol"
                          className="text-error hover:bg-error-container"
                          onClick={() => setDeleting(role)}
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
                    colSpan={6}
                    className="px-4 py-12 text-center font-body-md text-body-md text-secondary"
                  >
                    No se encontraron roles con ese criterio.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 bg-surface-container-low p-4">
          <span className="font-label-mono-xs text-label-mono-xs text-secondary">
            Mostrando{" "}
            <strong className="text-on-surface">{filteredRoles.length}</strong> de{" "}
            <strong className="text-on-surface">{roles.length}</strong> roles
          </span>
          <span className="flex items-center gap-1.5 font-label-mono-xs text-label-mono-xs text-secondary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-container" />
            Matriz RBAC
          </span>
        </div>
      </Card>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Editar rol" : "Nuevo rol"}
        description={
          editing
            ? "Actualiza el nombre y la descripción del rol."
            : "Crea el rol y luego asígnale accesos desde la acción de la llave."
        }
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setFormOpen(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button type="submit" form="role-form" disabled={saving}>
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
          id="role-form"
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          {formError ? (
            <div className="flex items-start gap-2 rounded-xl bg-error-container px-3 py-2.5 font-body-sm text-body-sm text-on-error-container">
              <Icon name="error" className="mt-0.5 text-[18px]" filled />
              <span>{formError}</span>
            </div>
          ) : null}

          <Input
            label="Nombre del rol"
            name="nombre"
            icon="badge"
            value={form.nombre}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                nombre: event.target.value,
              }))
            }
            placeholder="Ej. Administrador, Auditor, Soporte"
            required
          />

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
              placeholder="Responsabilidades o alcance del rol"
              className="w-full resize-none rounded-xl border border-surface-variant bg-surface-container-lowest px-4 py-2.5 text-body-md text-on-surface placeholder:text-secondary/80 focus:border-primary-container focus:outline-none focus:ring-2 focus:ring-primary-container/20"
            />
          </label>
        </form>
      </Modal>

      <Modal
        open={Boolean(accessFor)}
        onClose={() => setAccessFor(null)}
        title="Asignar accesos"
        description={
          accessFor
            ? `Selecciona los accesos que tendrá el rol ${accessFor.nombre}.`
            : undefined
        }
        size="lg"
        footer={
          <>
            <span className="mr-auto font-label-mono-xs text-label-mono-xs text-secondary">
              {selectedAccessIds.length} seleccionados
            </span>
            <Button
              variant="secondary"
              onClick={() => setAccessFor(null)}
              disabled={savingAccess}
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveAccesses} disabled={savingAccess}>
              <Icon
                name={savingAccess ? "progress_activity" : "key"}
                className={
                  savingAccess ? "animate-spin text-[17px]" : "text-[17px]"
                }
              />
              <span>{savingAccess ? "Guardando..." : "Guardar accesos"}</span>
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-5">
          {accessError ? (
            <div className="flex items-start gap-2 rounded-xl bg-error-container px-3 py-2.5 font-body-sm text-body-sm text-on-error-container">
              <Icon name="error" className="mt-0.5 text-[18px]" filled />
              <span>{accessError}</span>
            </div>
          ) : null}

          {Object.keys(groupedAccesses).length ? (
            Object.entries(groupedAccesses).map(([module, moduleAccesses]) => {
              const selectedCount = moduleAccesses.filter((access) =>
                selectedAccessIds.includes(access.id),
              ).length;
              const allSelected = selectedCount === moduleAccesses.length;

              return (
                <section key={module} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded bg-primary-container" />
                      <h3 className="font-label-mono-xs text-label-mono-xs uppercase tracking-wider text-secondary">
                        {module}
                      </h3>
                      <span className="rounded-full bg-surface-container px-2 py-0.5 font-label-mono-xs text-label-mono-xs text-secondary">
                        {selectedCount}/{moduleAccesses.length}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        toggleModule(moduleAccesses, !allSelected)
                      }
                      className="font-title-md text-body-sm text-primary-container hover:underline"
                    >
                      {allSelected ? "Quitar todos" : "Seleccionar todos"}
                    </button>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    {moduleAccesses.map((access) => {
                      const checked = selectedAccessIds.includes(access.id);

                      return (
                        <label
                          key={access.id}
                          className={cn(
                            "flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 transition-colors",
                            checked
                              ? "border-primary-container bg-surface-container-low"
                              : "border-surface-variant bg-surface-container-lowest hover:bg-surface-container-low",
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleAccess(access.id)}
                            className="mt-0.5 h-4 w-4 rounded accent-primary-container"
                          />
                          <span className="flex min-w-0 flex-1 flex-col">
                            <span className="truncate font-title-md text-body-sm text-on-surface">
                              {access.codigo}
                            </span>
                            <span className="font-body-sm text-body-sm text-secondary">
                              {access.descripcion || access.path || "Sin detalle"}
                            </span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </section>
              );
            })
          ) : (
            <p className="rounded-xl bg-surface-container-low px-3 py-6 text-center font-body-sm text-body-sm text-secondary">
              No hay accesos creados. Crea uno primero en la pestaña Accesos.
            </p>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Eliminar rol"
        description={
          deleting
            ? `Se eliminará el rol ${deleting.nombre} y sus asignaciones.`
            : ""
        }
        loading={deletingBusy}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
