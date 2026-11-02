"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button, buttonStyles } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { fleetSummary } from "@/lib/inventory";
import type { Asset } from "@/types/asset";
import { cn } from "@/lib/utils";

interface InventoryHeaderProps {
  assets: Asset[];
}

export function InventoryHeader({ assets }: InventoryHeaderProps) {
  const router = useRouter();

  function exportCsv() {
    const rows = assets.map((asset) => [
      asset.hostname,
      asset.model,
      asset.ip,
      asset.segment,
      asset.os,
      asset.owner.name,
      asset.status.label,
    ]);

    const csv = [
      ["Hostname", "Modelo", "IP", "Segmento", "SO", "Responsable", "Estado"],
      ...rows,
    ]
      .map((row) =>
        row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","),
      )
      .join("\n");

    const blob = new Blob([`\uFEFF${csv}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "inventario-activos.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <PageHeader
      eyebrow="ITAM // Infrastructure Fleet Topology"
      title="Inventario de Activos"
      badge={`${fleetSummary.totalAssets} Nodos Totales`}
      actions={
        <>
          <div className="flex items-center gap-2 rounded-full bg-surface-container-low px-3 py-1.5 shadow-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary-container" />
            <span className="font-label-mono-xs text-label-mono-xs text-secondary">
              Sincronizado:{" "}
              <strong className="font-medium text-on-surface">
                {fleetSummary.lastSync}
              </strong>
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.refresh()}
              aria-label="Sincronizar inventario"
              className="ml-1 p-0.5"
            >
              <Icon name="refresh" className="text-[15px]" />
            </Button>
          </div>

          <Button variant="secondary" onClick={exportCsv}>
            <Icon name="download" className="text-[17px]" />
            <span>Exportar CSV</span>
          </Button>

          <Link
            href="/inventory/new"
            className={cn(buttonStyles("primary", "md"), "px-5")}
          >
            <Icon name="add" className="text-[18px]" />
            <span>Registrar Nuevo Activo</span>
          </Link>
        </>
      }
    />
  );
}
