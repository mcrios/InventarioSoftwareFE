import type { Metadata } from "next";
import { FleetStats } from "@/components/dashboard/FleetStats";
import { InventoryHeader } from "@/components/dashboard/InventoryHeader";
import { InventoryWorkspace } from "@/components/dashboard/InventoryWorkspace";
import { ManufacturerChart } from "@/components/dashboard/ManufacturerChart";
import { TelemetryFeed } from "@/components/dashboard/TelemetryFeed";
import { assets } from "@/lib/inventory";

export const metadata: Metadata = {
  title: "Inventario de Activos",
};

export default function InventoryPage() {
  return (
    <>
      <InventoryHeader assets={assets} />
      <FleetStats />
      <InventoryWorkspace assets={assets} />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <TelemetryFeed />
        <ManufacturerChart />
      </div>
    </>
  );
}
