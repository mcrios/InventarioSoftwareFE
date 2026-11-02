import type { Metadata } from "next";
import { ModulePlaceholder } from "@/components/dashboard/ModulePlaceholder";

export const metadata: Metadata = {
  title: "Aprobaciones",
};

export default function ApprovalsPage() {
  return (
    <ModulePlaceholder
      eyebrow="Workflow // Governance"
      title="Aprobaciones"
      description="Centraliza las solicitudes para aplicar nuevas actualizaciones o parches."
      icon="verified_user"
      features={[
        "Flujos de aprobación por rol y criticidad",
        "Bandeja de solicitudes pendientes",
        "Trazabilidad de decisiones y comentarios",
        "Políticas de escalamiento automático",
      ]}
    />
  );
}
