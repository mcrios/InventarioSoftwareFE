import type { Metadata } from "next";
import Link from "next/link";
import { NewAssetForm } from "@/components/dashboard/NewAssetForm";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { buttonStyles } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Registrar Activo",
};

export default function NewAssetPage() {
  return (
    <>
      <PageHeader
        eyebrow="ITAM // Asset Onboarding"
        title="Registrar Nuevo Activo"
        badge="Alta de flota"
        description="Completa la ficha técnica para incorporar un nuevo nodo al inventario."
        actions={
          <Link
            href="/inventory"
            className={cn(buttonStyles("secondary", "md"), "rounded-xl")}
          >
            <Icon name="arrow_back" className="text-[17px]" />
            <span>Volver al inventario</span>
          </Link>
        }
      />

      <NewAssetForm />
    </>
  );
}
