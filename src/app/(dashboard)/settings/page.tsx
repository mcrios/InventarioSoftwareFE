import type { Metadata } from "next";
import { ModulePlaceholder } from "@/components/dashboard/ModulePlaceholder";

export const metadata: Metadata = {
  title: "Configuración",
};

export default function SettingsPage() {
  return (
    <ModulePlaceholder
      eyebrow="Administración // Platform Settings"
      title="Configuración"
      description="Define preferencias de la organización, integraciones y reglas globales de la plataforma."
      icon="settings"
      features={[
        "Perfil de la organización y centros de costo",
        "Integraciones con MDM, cloud y escáneres",
        "Reglas de notificación y retención de datos",
        "Claves de API y auditoría de accesos",
      ]}
    />
  );
}
