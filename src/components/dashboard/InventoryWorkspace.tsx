"use client";

import { useMemo, useState } from "react";
import { AssetTable } from "@/components/dashboard/AssetTable";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Select } from "@/components/ui/Select";
import { fleetSummary } from "@/lib/inventory";
import type { Asset, AssetCategory } from "@/types/asset";

interface InventoryWorkspaceProps {
  assets: Asset[];
}

function matchesQuery(asset: Asset, query: string) {
  const value = query.trim().toLowerCase();

  if (!value) {
    return true;
  }

  return [
    asset.hostname,
    asset.model,
    asset.serial,
    asset.ip,
    asset.segment,
    asset.os,
    asset.specs,
    asset.owner.name,
    asset.owner.role,
    asset.status.label,
  ]
    .join(" ")
    .toLowerCase()
    .includes(value);
}

export function InventoryWorkspace({ assets }: InventoryWorkspaceProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<AssetCategory | "all">("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pageSize, setPageSize] = useState("10");

  const filteredAssets = useMemo(
    () =>
      assets.filter(
        (asset) =>
          (category === "all" || asset.category === category) &&
          matchesQuery(asset, query),
      ),
    [assets, category, query],
  );

  function toggleAsset(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }

  function toggleAll() {
    setSelectedIds((current) => {
      const next = new Set(current);
      const allSelected =
        filteredAssets.length > 0 &&
        filteredAssets.every((asset) => next.has(asset.id));

      filteredAssets.forEach((asset) => {
        if (allSelected) {
          next.delete(asset.id);
        } else {
          next.add(asset.id);
        }
      });

      return next;
    });
  }

  function resetFilters() {
    setQuery("");
    setCategory("all");
  }

  return (
    <>
      <FilterBar
        query={query}
        onQueryChange={setQuery}
        category={category}
        onCategoryChange={setCategory}
        onReset={resetFilters}
      />

      <Card className="mb-5 overflow-hidden">
        <AssetTable
          assets={filteredAssets}
          selectedIds={selectedIds}
          onToggle={toggleAsset}
          onToggleAll={toggleAll}
        />

        <div className="flex flex-col gap-3 bg-surface-container-low p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-label-mono-xs text-label-mono-xs text-secondary">
              {filteredAssets.length ? (
                <>
                  Mostrando{" "}
                  <strong className="text-on-surface">
                    1 a {filteredAssets.length}
                  </strong>{" "}
                  de{" "}
                  <strong className="text-on-surface">
                    {fleetSummary.totalAssets}
                  </strong>{" "}
                  activos registrados
                </>
              ) : (
                "Sin resultados para los filtros actuales"
              )}
            </span>
            <div className="flex items-center gap-1.5 pl-3">
              <span className="font-label-mono-xs text-label-mono-xs text-secondary">
                Por página:
              </span>
              <Select
                value={pageSize}
                onChange={setPageSize}
                options={["10", "25", "50", "100"].map((option) => ({
                  value: option,
                  label: option,
                }))}
                ariaLabel="Activos por página"
                size="sm"
                searchable={false}
                containerClassName="w-20"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled
              aria-label="Página anterior"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container text-secondary transition-colors hover:bg-surface-container-high hover:text-on-surface disabled:opacity-40"
            >
              <Icon name="chevron_left" className="text-[18px]" />
            </button>
            <button
              type="button"
              aria-current="page"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-container font-label-mono-xs text-label-mono-xs font-bold text-on-primary shadow-sm"
            >
              1
            </button>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container font-label-mono-xs text-label-mono-xs text-on-surface transition-colors hover:bg-surface-container-high"
            >
              2
            </button>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container font-label-mono-xs text-label-mono-xs text-on-surface transition-colors hover:bg-surface-container-high"
            >
              3
            </button>
            <span className="px-1 font-label-mono-xs text-label-mono-xs text-secondary">
              ...
            </span>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container font-label-mono-xs text-label-mono-xs text-on-surface transition-colors hover:bg-surface-container-high"
            >
              143
            </button>
            <button
              type="button"
              aria-label="Página siguiente"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container text-secondary transition-colors hover:bg-surface-container-high hover:text-on-surface"
            >
              <Icon name="chevron_right" className="text-[18px]" />
            </button>
          </div>
        </div>
      </Card>
    </>
  );
}
