import type { Metadata } from "next";
import { ModulePlaceholder } from "@/components/dashboard/ModulePlaceholder";

export const metadata: Metadata = {
  title: "Software y Parches",
};

export default function SoftwarePage() {
  return (
    <ModulePlaceholder
      eyebrow="ITAM // Patch Management"
      title="Software y Parches"
      description="Controla el software instalado, las versiones y las ventanas de actualización de la flota."
      icon="system_update_alt"
      features={[
        "Catálogo de software instalado por activo",
        "Ventanas de mantenimiento y despliegues programados",
        "Detección de versiones fuera de soporte",
        "Historial de parches aplicados",
      ]}
    />
  );
}
