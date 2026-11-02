import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { UsersTable } from "@/components/users/UsersTable";
import { users } from "@/lib/users";

export const metadata: Metadata = {
  title: "Usuarios y Roles",
};

export default function UsersPage() {
  return (
    <>
      <PageHeader
        eyebrow="Administración // IAM"
        title="Usuarios y Roles"
        badge={`${users.length} Cuentas`}
        description="Gestiona el acceso del equipo, los roles operativos y el estado de las invitaciones."
      />

      <UsersTable users={users} />
    </>
  );
}
