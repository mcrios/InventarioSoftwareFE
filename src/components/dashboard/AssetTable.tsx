"use client";

import { AssetRow } from "@/components/dashboard/AssetRow";
import type { Asset } from "@/types/asset";

interface AssetTableProps {
  assets: Asset[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: () => void;
}

export function AssetTable({
  assets,
  selectedIds,
  onToggle,
  onToggleAll,
}: AssetTableProps) {
  const allSelected =
    assets.length > 0 && assets.every((asset) => selectedIds.has(asset.id));

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-surface-container font-label-mono-xs text-label-mono-xs uppercase tracking-wider text-secondary">
            <th className="w-12 px-4 py-3 text-center">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onToggleAll}
                aria-label="Seleccionar todos los activos visibles"
                className="h-3.5 w-3.5 cursor-pointer rounded accent-primary-container"
              />
            </th>
            <th className="px-4 py-3 font-semibold">Nombre de Host &amp; Tipo</th>
            <th className="px-4 py-3 font-semibold">
              Dirección IP &amp; Segmento
            </th>
            <th className="px-4 py-3 font-semibold">
              Especificaciones / SO
            </th>
            <th className="px-4 py-3 font-semibold">Responsable Asignado</th>
            <th className="px-4 py-3 font-semibold">Estado de Salud</th>
            <th className="px-4 py-3 text-right font-semibold">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-container bg-surface-container-lowest">
          {assets.length ? (
            assets.map((asset) => (
              <AssetRow
                key={asset.id}
                asset={asset}
                selected={selectedIds.has(asset.id)}
                onToggle={onToggle}
              />
            ))
          ) : (
            <tr>
              <td
                colSpan={7}
                className="px-4 py-12 text-center font-body-md text-body-md text-secondary"
              >
                No se encontraron activos con los filtros seleccionados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
