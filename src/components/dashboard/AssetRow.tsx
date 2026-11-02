import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { Asset } from "@/types/asset";
import { cn } from "@/lib/utils";

interface AssetRowProps {
  asset: Asset;
  selected: boolean;
  onToggle: (id: string) => void;
}

export function AssetRow({ asset, selected, onToggle }: AssetRowProps) {
  const isCritical = asset.alert;

  return (
    <tr
      className={cn(
        "group transition-colors hover:bg-surface-container-low",
        isCritical && "bg-error-container/20",
      )}
    >
      <td className="px-4 py-3.5 text-center">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggle(asset.id)}
          aria-label={`Seleccionar ${asset.hostname}`}
          className="h-3.5 w-3.5 cursor-pointer rounded accent-primary-container"
        />
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl shadow-sm",
              isCritical
                ? "bg-error-container text-error"
                : "bg-surface-container text-on-surface",
            )}
          >
            <Icon name={asset.icon} className="text-[20px]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-headline-sm text-body-lg font-semibold text-on-surface">
                {asset.hostname}
              </span>
              <span
                className={cn(
                  "rounded px-2 py-0.5 font-label-mono-xs text-label-mono-xs font-medium",
                  asset.modelTone === "danger"
                    ? "bg-error text-on-error"
                    : "bg-surface-container text-on-surface",
                )}
              >
                {asset.model}
              </span>
            </div>
            <span className="mt-0.5 font-label-mono-xs text-label-mono-xs text-secondary">
              {asset.serial}
            </span>
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <div className="flex flex-col">
          <span className="font-code-md text-code-md font-semibold text-on-surface">
            {asset.ip}
          </span>
          <span className="mt-0.5 font-label-mono-xs text-label-mono-xs text-secondary">
            {asset.segment}
          </span>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                asset.osAlert ? "bg-error" : "bg-secondary",
              )}
            />
            <span className="font-title-md text-body-sm font-medium text-on-surface">
              {asset.os}
            </span>
          </div>
          <span
            className={cn(
              "mt-0.5 font-label-mono-xs text-label-mono-xs",
              asset.osAlert
                ? "font-medium text-error"
                : "text-secondary",
            )}
          >
            {asset.specs}
          </span>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full font-headline-sm text-label-mono-xs font-bold",
              asset.owner.avatar === "primary"
                ? "bg-primary-container text-on-primary"
                : "bg-surface-container-high text-on-surface",
            )}
          >
            {asset.owner.initials}
          </div>
          <div className="flex flex-col">
            <span className="font-title-md text-body-sm text-on-surface">
              {asset.owner.name}
            </span>
            <span className="font-label-mono-xs text-label-mono-xs text-secondary">
              {asset.owner.role}
            </span>
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <Badge
          tone={asset.status.tone}
          className={cn(isCritical && "animate-pulse")}
        >
          {asset.status.icon ? (
            <Icon
              name={asset.status.icon}
              className="text-[13px]"
            />
          ) : (
            <span className="h-2 w-2 rounded-full bg-primary-container" />
          )}
          <span>{asset.status.label}</span>
        </Badge>
      </td>
      <td className="px-4 py-3.5 text-right">
        <div className="flex items-center justify-end gap-1">
          <Button
            variant={asset.action.tone}
            size="sm"
            className="rounded-lg"
          >
            {asset.action.label}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Más acciones para ${asset.hostname}`}
          >
            <Icon name="more_vert" className="text-[18px]" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
