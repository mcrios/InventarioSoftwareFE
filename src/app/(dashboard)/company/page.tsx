import type { Metadata } from "next";
import { CompanyWorkspace } from "@/components/company/CompanyWorkspace";

export const metadata: Metadata = {
  title: "Mantenimiento de Empresas",
};

export default function CompanyPage() {
  return <CompanyWorkspace />;
}
