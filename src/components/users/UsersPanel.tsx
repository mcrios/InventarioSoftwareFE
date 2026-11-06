"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { formatDateTime } from "@/lib/format";
import { securityService } from "@/lib/securityService";
import { cn, getErrorMessage } from "@/lib/utils";
import type { Empresa, Rol, Usuario, UsuarioInput } from "@/types/api";

interface UsersPanelProps {
  usuarios: Usuario[];
  roles: Rol[];
  empresas: Empresa[];
  onRefresh: () => Promise<void>;
  notify: (message: string, tone?: "success" | "error") => void;
}

interface UserFormState {
  nombre: string;
  email: string;
  password: string;
  activo: boolean;
}

const emptyForm: UserFormState = {
  nombre: "",
  email: "",
  password: "",
  activo: true,
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "?";
}

export function UsersPanel({
  usuarios,
  roles,
  empresas,
  onRefresh,
  notify,
}: UsersPanelProps) {
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Usuario | null>(null);
  const [form, setForm] = useState<UserFormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [rolesFor, setRolesFor] = useState<Usuario | null>(null);
  const [empresasFor, setEmpresasFor] = useState<Usuario | null>(null);
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
  const [selectedEmpresaIds, setSelectedEmpresaIds] = useState<number[]>([]);
  
  const [rolesError, setRolesError] = useState<string | null>(null);
  const [savingRoles, setSavingRoles] = useState(false);

  const [deleting, setDeleting] = useState<Usuario | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);

  const filteredUsers = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return usuarios;

    return usuarios.filter((user) =>
      [
        user.nombre,
        user.email,
        user.activo ? "activo" : "inactivo",
        ...user.roles.map((role) => role.nombre),
      ]
        .join(" ")
        .toLowerCase()
        .includes(value),
    );
  }, [query, usuarios]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
    setFormOpen(true);
  }

  function openEdit(user: Usuario) {
    setEditing(user);
    setForm({
      nombre: user.nombre,
      email: user.email,
      password: "",
      activo: user.activo,
    });
    setFormError(null);
    setFormOpen(true);
  }

  function openRoleAssignment(user: Usuario) {
    setRolesFor(user);
    setSelectedRoleIds(user.roles.map((role) => role.id));
    setRolesError(null);
  }
  function openCompanyAssignment(user: Usuario) {
    setEmpresasFor(user);
    setSelectedEmpresaIds(user.empresas.map((empresa) => empresa.id));
    setRolesError(null);
  }

  function toggleRole(id: number, type : string) {
    switch (type) {
      case "ROL":
        setSelectedRoleIds((current) =>
          current.includes(id)
            ? current.filter((roleId) => roleId !== id)
            : [...current, id],
        );
        break;
      
      case "EMPRESA":
        setSelectedEmpresaIds((current) =>
          current.includes(id)
            ? current.filter((empresa) => empresa !== id)
            : [...current, id],
        );
        break;

      default:
        break;
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setFormError(null);

    const payload: UsuarioInput = {
      nombre: form.nombre.trim(),
      email: form.email.trim(),
      activo: form.activo,
      roles: editing?.roles.map((role) => ({ id: role.id })) ?? [],
      empresas: editing?.empresas.map((empresa) => ({ id: empresa.id })) ?? [],
      ...(form.password ? { password: form.password } : {}),
    };

    try {
      if (editing) {
        await securityService.updateUsuario(editing.id, payload);
        notify("Usuario actualizado correctamente.");
      } else {
        await securityService.createUsuario(payload);
        notify("Usuario creado correctamente.");
      }

      setFormOpen(false);
      await onRefresh();
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveRoles() {
    if (!rolesFor) return;

    setSavingRoles(true);
    setRolesError(null);

    const payload: UsuarioInput = {
      nombre: rolesFor.nombre,
      email: rolesFor.email,
      activo: rolesFor.activo,
      roles: selectedRoleIds.map((id) => ({ id })),
      empresas: rolesFor.empresas.map((empresa) => ({ id: empresa.id })),
    };

    try {
      await securityService.updateUsuario(rolesFor.id, payload);
      setRolesFor(null);
      notify("Roles del usuario actualizados.");
      await onRefresh();
    } catch (error) {
      setRolesError(getErrorMessage(error));
    } finally {
      setSavingRoles(false);
    }
  }

  async function handleSaveEmpresas() {
    if (!empresasFor) return;

    setSavingRoles(true);
    setRolesError(null);

    const payload: UsuarioInput = {
      nombre: empresasFor.nombre,
      email: empresasFor.email,
      activo: empresasFor.activo,
      roles: empresasFor.roles.map((rol) => ({ id: rol.id })),
      empresas: selectedEmpresaIds.map((id) => ({ id })),
    };

    try {
      await securityService.updateUsuario(empresasFor.id, payload);
      setRolesFor(null);
      notify("Empresas del usuario actualizadas.");
      await onRefresh();
    } catch (error) {
      setRolesError(getErrorMessage(error));
    } finally {
      setSavingRoles(false);
    }
  }

  async function handleDelete() {
    if (!deleting) return;

    setDeletingBusy(true);
    try {
      await securityService.deleteUsuario(deleting.id);
      setDeleting(null);
      notify("Usuario eliminado correctamente.");
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
            placeholder="Buscar por nombre, correo, rol o estado..."
            className="w-full bg-transparent font-body-md text-body-md text-on-surface placeholder:text-secondary focus:outline-none"
          />
        </div>

        <Button onClick={openCreate}>
          <Icon name="person_add" className="text-[18px]" />
          <span>Nuevo usuario</span>
        </Button>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container font-label-mono-xs text-label-mono-xs uppercase tracking-wider text-secondary">
                <th className="px-4 py-3 font-semibold">Usuario</th>
                <th className="px-4 py-3 font-semibold">Correo</th>
                <th className="px-4 py-3 font-semibold">Roles</th>
                <th className="px-4 py-3 font-semibold">Empresas</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold">Último acceso</th>
                <th className="px-4 py-3 text-center font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container bg-surface-container-lowest">
              {filteredUsers.length ? (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="transition-colors hover:bg-surface-container-low"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary font-label-mono-xs text-label-mono-xs font-bold text-on-primary">
                          {getInitials(user.nombre)}
                        </div>
                        <div className="flex min-w-0 flex-col">
                          <span className="truncate font-title-md text-body-sm text-on-surface">
                            {user.nombre}
                          </span>
                          <span className="font-label-mono-xs text-label-mono-xs text-secondary">
                            ID #{user.id}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-body-sm text-body-sm text-secondary">
                      {user.email}
                    </td>
                    <td className="px-4 py-3.5">
                      {user.roles.length ? (
                        <div className="flex flex-wrap gap-1">
                          {user.roles.slice(0, 2).map((role) => (
                            <span
                              key={role.id}
                              className="rounded bg-surface-container px-2 py-0.5 font-label-mono-xs text-label-mono-xs text-on-surface"
                            >
                              {role.nombre}
                            </span>
                          ))}
                          {user.roles.length > 2 ? (
                            <span className="rounded bg-dark px-2 py-0.5 font-label-mono-xs text-label-mono-xs text-on-dark">
                              +{user.roles.length - 2}
                            </span>
                          ) : null}
                        </div>
                      ) : (
                        <span className="font-body-sm text-body-sm text-secondary">
                          Sin roles
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {user.empresas.length ? (
                        <div className="flex flex-wrap gap-1">
                          {user.empresas.slice(0, 2).map((empresa) => (
                            <span
                              key={empresa.id}
                              className="rounded bg-surface-container px-2 py-0.5 font-label-mono-xs text-label-mono-xs text-on-surface"
                            >
                              {empresa.nombre}
                            </span>
                          ))}
                          {user.empresas.length > 2 ? (
                            <span className="rounded bg-dark px-2 py-0.5 font-label-mono-xs text-label-mono-xs text-on-dark">
                              +{user.empresas.length - 2}
                            </span>
                          ) : null}
                        </div>
                      ) : (
                        <span className="font-body-sm text-body-sm text-secondary">
                          Sin Empresas
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge tone={user.activo ? "success" : "danger"}>
                        <span
                          className={cn(
                            "h-2 w-2 rounded-full",
                            user.activo
                              ? "bg-primary-container"
                              : "bg-current",
                          )}
                        />
                        {user.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 font-body-sm text-body-sm text-secondary">
                      {formatDateTime(user.ultimoAcceso)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Editar a ${user.nombre}`}
                          title="Editar usuario"
                          onClick={() => openEdit(user)}
                        >
                          <Icon name="edit" className="text-[18px]" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Asignar roles a ${user.nombre}`}
                          title="Asignar roles"
                          onClick={() => openRoleAssignment(user)}
                        >
                          <Icon name="manage_accounts" className="text-[18px]" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Asignar empresas a ${user.nombre}`}
                          title="Asignar empresas"
                          onClick={() => openCompanyAssignment(user)}
                        >
                          <Icon name="domain_add" className="text-[18px]" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Eliminar a ${user.nombre}`}
                          title="Eliminar usuario"
                          className="text-error hover:bg-error-container"
                          onClick={() => setDeleting(user)}
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
                    No se encontraron usuarios con ese criterio.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 bg-surface-container-low p-4">
          <span className="font-label-mono-xs text-label-mono-xs text-secondary">
            Mostrando{" "}
            <strong className="text-on-surface">{filteredUsers.length}</strong> de{" "}
            <strong className="text-on-surface">{usuarios.length}</strong>{" "}
            usuarios
          </span>
          <span className="flex items-center gap-1.5 font-label-mono-xs text-label-mono-xs text-secondary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-container" />
            IAM sincronizado
          </span>
        </div>
      </Card>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Editar usuario" : "Nuevo usuario"}
        description={
          editing
            ? "Actualiza los datos de la cuenta. Deja la contraseña vacía para conservarla."
            : "Crea una cuenta y asígnale roles desde la acción correspondiente."
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
            <Button type="submit" form="user-form" disabled={saving}>
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
          id="user-form"
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
              label="Nombre completo"
              name="nombre"
              icon="person"
              value={form.nombre}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  nombre: event.target.value,
                }))
              }
              placeholder="Nombre y apellido"
              required
            />
            <Input
              label="Correo corporativo"
              name="email"
              type="email"
              icon="mail"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
              placeholder="usuario@empresa.com"
              required
            />
          </div>

          <Input
            label={editing ? "Nueva contraseña (opcional)" : "Contraseña"}
            name="password"
            type="password"
            icon="lock"
            autoComplete="new-password"
            value={form.password}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                password: event.target.value,
              }))
            }
            placeholder={
              editing ? "Dejar vacío para conservar" : "Mínimo 8 caracteres"
            }
            required={!editing}
            hint={
              editing
                ? "Solo se enviará si escribes una contraseña nueva."
                : undefined
            }
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
            Usuario activo (puede iniciar sesión)
          </label>
        </form>
      </Modal>

      <Modal
        open={Boolean(rolesFor)}
        onClose={() => setRolesFor(null)}
        title="Asignar roles"
        description={
          rolesFor
            ? `Selecciona los roles que tendrá ${rolesFor.nombre}.`
            : undefined
        }
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setRolesFor(null)}
              disabled={savingRoles}
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveRoles} disabled={savingRoles}>
              <Icon
                name={savingRoles ? "progress_activity" : "verified_user"}
                className={
                  savingRoles ? "animate-spin text-[17px]" : "text-[17px]"
                }
              />
              <span>{savingRoles ? "Guardando..." : "Guardar roles"}</span>
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          {rolesError ? (
            <div className="flex items-start gap-2 rounded-xl bg-error-container px-3 py-2.5 font-body-sm text-body-sm text-on-error-container">
              <Icon name="error" className="mt-0.5 text-[18px]" filled />
              <span>{rolesError}</span>
            </div>
          ) : null}

          {roles.length ? (
            roles.map((role) => {
              const checked = selectedRoleIds.includes(role.id);

              return (
                <label
                  key={role.id}
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
                    onChange={() => toggleRole(role.id, "ROL")}
                    className="mt-0.5 h-4 w-4 rounded accent-primary-container"
                  />
                  <span className="flex flex-1 flex-col">
                    <span className="font-title-md text-body-sm text-on-surface">
                      {role.nombre}
                    </span>
                    <span className="font-body-sm text-body-sm text-secondary">
                      {role.descripcion || "Sin descripción"}
                    </span>
                  </span>
                  <span className="rounded bg-surface-container px-2 py-0.5 font-label-mono-xs text-label-mono-xs text-secondary">
                    {role.accesos.length} accesos
                  </span>
                </label>
              );
            })
          ) : (
            <p className="rounded-xl bg-surface-container-low px-3 py-6 text-center font-body-sm text-body-sm text-secondary">
              No hay roles creados. Crea un rol primero.
            </p>
          )}
        </div>
      </Modal>

      <Modal
        open={Boolean(empresasFor)}
        onClose={() => setEmpresasFor(null)}
        title="Asignar Empresas"
        description={
          empresasFor
            ? `Selecciona las empresas que tendrá ${empresasFor.nombre}.`
            : undefined
        }
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setEmpresasFor(null)}
              disabled={savingRoles}
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveEmpresas} disabled={savingRoles}>
              <Icon
                name={savingRoles ? "progress_activity" : "verified_user"}
                className={
                  savingRoles ? "animate-spin text-[17px]" : "text-[17px]"
                }
              />
              <span>{savingRoles ? "Guardando..." : "Guardar Empresas"}</span>
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          {rolesError ? (
            <div className="flex items-start gap-2 rounded-xl bg-error-container px-3 py-2.5 font-body-sm text-body-sm text-on-error-container">
              <Icon name="error" className="mt-0.5 text-[18px]" filled />
              <span>{rolesError}</span>
            </div>
          ) : null}

          {empresas.length ? (
            empresas.map((empresa) => {
              const checked = selectedEmpresaIds.includes(empresa.id);

              return (
                <label
                  key={empresa.id}
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
                    onChange={() => toggleRole(empresa.id, "EMPRESA")}
                    className="mt-0.5 h-4 w-4 rounded accent-primary-container"
                  />
                  <span className="flex flex-1 flex-col">
                    <span className="font-title-md text-body-sm text-on-surface">
                      {empresa.nombre}
                    </span>
                    <span className="font-body-sm text-body-sm text-secondary">
                      {empresa.identificador || "Sin descripción"}
                    </span>
                  </span>
                </label>
              );
            })
          ) : (
            <p className="rounded-xl bg-surface-container-low px-3 py-6 text-center font-body-sm text-body-sm text-secondary">
              No hay empresas creadas. Crea una empresa primero.
            </p>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Eliminar usuario"
        description={
          deleting
            ? `Se eliminará la cuenta de ${deleting.nombre} (${deleting.email}).`
            : ""
        }
        loading={deletingBusy}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
