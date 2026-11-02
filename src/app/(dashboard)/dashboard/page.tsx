import type { Metadata } from "next";
import Link from "next/link";
import { FleetStats } from "@/components/dashboard/FleetStats";
import { ManufacturerChart } from "@/components/dashboard/ManufacturerChart";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { QuickAccess } from "@/components/dashboard/QuickAccess";
import { TelemetryFeed } from "@/components/dashboard/TelemetryFeed";
import { buttonStyles } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = {
  title: "Panel de Control",
};

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        eyebrow="ERP // Operations Overview"
        title="Panel de Control"
        badge="Operación en vivo"
        description="Resumen de la flota, cumplimiento y las tareas pendientes del ciclo de vida del software en uso."
        actions={
          <Link href="/inventory" className={buttonStyles("primary", "md")}>
            <Icon name="devices" className="text-[17px]" />
            <span>Ver inventario</span>
          </Link>
        }
      />

      <FleetStats />
      <QuickAccess />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <TelemetryFeed />
        <ManufacturerChart />
      </div>
    </>
  );
}
