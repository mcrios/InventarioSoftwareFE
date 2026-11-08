import type { Metadata } from "next";
import { EquipmentWorkspace } from "@/components/equipment/EquipmentWorkspace";

export const metadata: Metadata = {
  title: "Inventario de Equipos",
};

export default function InventoryPage() {
  return <EquipmentWorkspace />;
}
