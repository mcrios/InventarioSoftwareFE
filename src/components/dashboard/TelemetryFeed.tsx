import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { Licencia } from "@/types/api";
import Link from "next/link";

interface TelemetryProps {
  licencias: Licencia[]
}

const toneStyles = {
  success: { dot: "bg-primary-container", host: "text-on-surface" },
  danger: { dot: "bg-error animate-ping", host: "text-error" },
  neutral: { dot: "bg-secondary", host: "text-on-surface" },
} as const;

export function TelemetryFeed({licencias}: TelemetryProps) {
  return (
    <Card className="flex flex-col justify-between p-5 xl:col-span-7">
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <Icon
            name="dynamic_feed"
            className="text-[20px] text-primary-container"
          />
          <h2 className="font-headline-sm text-headline-sm text-on-surface">
            Licencias activas
          </h2>
        </div>
        <span className="rounded-full bg-surface-container px-2 py-0.5 font-label-mono-xs text-label-mono-xs text-secondary">
          Cantidas Restante
        </span>
      </div>

      <div className="mt-2 flex flex-col gap-2.5">
        {licencias.map((event) => (
          <div
            key={event.id}
            className="flex flex-col gap-2 rounded-xl bg-surface-container-lowest p-2.5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={cn("h-2 w-2 rounded-full", toneStyles["success"].dot)}
              />
              <span
                className={cn(
                  "font-code-md text-code-md font-medium",
                  toneStyles["success"].host,
                )}
              >
                {event.codigoClave}
              </span>
              <span className="font-body-sm text-body-sm text-secondary">
                {event.empresa.nombre}
              </span>
            </div>
            <span className="font-label-mono-xs text-label-mono-xs text-secondary">
              {event.cantidadUsada + "/"+event.cantidadTotal}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <span className="font-label-mono-xs text-label-mono-xs text-secondary">
          
        </span>
        <Link
          href="/notifications"
          className="font-title-md text-body-sm text-primary-container hover:underline"
        >
          Abrir Centro de Alertas →
        </Link>
      </div>
    </Card>
  );
}
