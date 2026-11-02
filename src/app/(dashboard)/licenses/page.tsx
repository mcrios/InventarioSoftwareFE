import type { Metadata } from "next";
import { ModulePlaceholder } from "@/components/dashboard/ModulePlaceholder";

export const metadata: Metadata = {
  title: "Gestión de Licencias",
};

export default function LicensesPage() {
  return (
    <ModulePlaceholder
      eyebrow="SAM // License Management"
      title="Gestión de Licencias"
      description="Administra proveedores, asientos contratados y renovaciones del software de la empresa."
      icon="key"
      features={[
        "Inventario de licencias y asientos disponibles",
        "Alertas de renovación y vencimiento",
        "Conciliación entre licencias y software instalado",
        "Costo por proveedor y centro de costo",
      ]}
    />
  );
}
