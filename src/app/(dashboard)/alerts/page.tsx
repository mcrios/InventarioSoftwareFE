import type { Metadata } from "next";
import { ModulePlaceholder } from "@/components/dashboard/ModulePlaceholder";

export const metadata: Metadata = {
  title: "Alertas y CVEs",
};

export default function AlertsPage() {
  return (
    <ModulePlaceholder
      eyebrow="SecOps // Threat Tracking"
      title="Alertas & CVEs"
      description="Sigue los hallazgos de vulnerabilidad, su severidad y el estado de remediación de la flota."
      icon="notifications_active"
      features={[
        "Cola de CVEs priorizada por severidad",
        "Seguimiento de remediación por activo",
        "Integración con escáneres y SIEM",
        "Notificaciones y reglas de escalamiento",
      ]}
    />
  );
}
