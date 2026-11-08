import type { Metadata } from "next";
import { LicenseWorkspace } from "@/components/licenses/LicenseWorkspace";

export const metadata: Metadata = {
  title: "Gestión de Licencias",
};

export default function LicensesPage() {
  return <LicenseWorkspace />;
}
