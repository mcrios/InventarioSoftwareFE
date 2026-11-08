"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { User, UserRole, UserStatus } from "@/types/user";

interface UsersTableProps {
  users: User[];
}

const statusTones: Record<UserStatus, BadgeTone> = {
  Activo: "success",
  Invitado: "warning",
  Suspendido: "danger",
};

const roles: Array<UserRole | "Todos"> = [
  "Todos",
  "Administrador",
  "SecOps",
  "DevOps",
  "Finanzas",
  "Soporte",
];

export function UsersTable({ users }: UsersTableProps) {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<UserRole | "Todos">("Todos");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteRole, setInviteRole] = useState("Soporte");
  const [inviteSent, setInviteSent] = useState(false);

  const filteredUsers = useMemo(() => {
    const value = query.trim().toLowerCase();

    return users.filter((user) => {
      const matchesRole = role === "Todos" || user.role === role;
      const matchesQuery =
        !value ||
        [user.name, user.email, user.role, user.status]
          .join(" ")
          .toLowerCase()
          .includes(value);

      return matchesRole && matchesQuery;
    });
  }, [users, query, role]);

  function handleInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setInviteSent(true);
    setInviteOpen(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-3 p-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div className="flex flex-1 items-center gap-2 rounded-xl bg-surface-container-lowest px-4 py-2 shadow-sm">
            <Icon name="search" className="text-[20px] text-secondary" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por nombre, correo o rol..."
              className="w-full bg-transparent font-body-md text-body-md text-on-surface placeholder:text-secondary focus:outline-none"
            />
          </div>
          <Select
            value={role}
            onChange={(value) => setRole(value as UserRole | "Todos")}
            options={roles.map((option) => ({
              value: option,
              label: `Rol: ${option}`,
            }))}
            ariaLabel="Filtrar usuarios por rol"
            searchable={false}
            containerClassName="sm:w-48"
          />
        </div>

        <Button onClick={() => setInviteOpen((value) => !value)}>
          <Icon name="person_add" className="text-[18px]" />
          <span>Invitar usuario</span>
        </Button>
      </Card>

      {inviteOpen ? (
        <Card className="p-4">
          <form
            onSubmit={handleInvite}
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
          >
            <Input
              label="Correo corporativo"
              name="invite-email"
              type="email"
              icon="mail"
              required
              placeholder="nombre@empresa.com"
              containerClassName="flex-1"
            />
            <Select
              label="Rol"
              id="invite-role"
              value={inviteRole}
              onChange={setInviteRole}
              options={roles
                .filter((option) => option !== "Todos")
                .map((option) => ({ value: option, label: option }))}
              searchable={false}
              containerClassName="sm:w-44"
            />
            <Button type="submit">
              <Icon name="send" className="text-[17px]" />
              <span>Enviar invitación</span>
            </Button>
          </form>
        </Card>
      ) : null}

      {inviteSent ? (
        <div className="flex items-center gap-2 rounded-xl bg-secondary-container px-4 py-2.5 font-body-sm text-body-sm text-on-secondary-container">
          <Icon name="check_circle" className="text-[18px]" filled />
          <span>Invitación preparada. Conecta el backend para enviarla.</span>
        </div>
      ) : null}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container font-label-mono-xs text-label-mono-xs uppercase tracking-wider text-secondary">
                <th className="px-4 py-3 font-semibold">Usuario</th>
                <th className="px-4 py-3 font-semibold">Correo</th>
                <th className="px-4 py-3 font-semibold">Rol</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold">Último acceso</th>
                <th className="px-4 py-3 text-right font-semibold">Acciones</th>
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
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-high font-label-mono-xs text-label-mono-xs font-bold text-on-surface">
                          {user.initials}
                        </div>
                        <span className="font-title-md text-body-sm text-on-surface">
                          {user.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-body-sm text-body-sm text-secondary">
                      {user.email}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="rounded bg-surface-container px-2 py-0.5 font-label-mono-xs text-label-mono-xs text-on-surface">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge tone={statusTones[user.status]}>
                        <span
                          className={
                            user.status === "Activo"
                              ? "h-2 w-2 rounded-full bg-primary-container"
                              : "h-2 w-2 rounded-full bg-current"
                          }
                        />
                        {user.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 font-body-sm text-body-sm text-secondary">
                      {user.lastAccess}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Acciones para ${user.name}`}
                      >
                        <Icon name="more_vert" className="text-[18px]" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center font-body-md text-body-md text-secondary"
                  >
                    No se encontraron usuarios con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between bg-surface-container-low p-4">
          <span className="font-label-mono-xs text-label-mono-xs text-secondary">
            Mostrando{" "}
            <strong className="text-on-surface">{filteredUsers.length}</strong>{" "}
            de <strong className="text-on-surface">{users.length}</strong>{" "}
            usuarios
          </span>
          <span className="font-label-mono-xs text-label-mono-xs text-secondary">
            IAM sincronizado
          </span>
        </div>
      </Card>
    </div>
  );
}
