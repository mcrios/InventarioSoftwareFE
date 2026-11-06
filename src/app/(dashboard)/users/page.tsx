import type { Metadata } from "next";
import { SecurityWorkspace } from "@/components/users/SecurityWorkspace";

export const metadata: Metadata = {
  title: "Usuarios y Roles",
};

export default function UsersPage() {
  return <SecurityWorkspace />;
}
