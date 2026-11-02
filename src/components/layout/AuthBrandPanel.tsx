import { Icon } from "@/components/ui/Icon";

const highlights = [
  {
    icon: "devices",
    title: "Inventario unificado",
    description: "Servidores, endpoints y cloud en un solo grafo de activos.",
  },
  {
    icon: "verified_user",
    title: "Cumplimiento continuo",
    description: "Parches, licencias y CVEs monitoreados en tiempo real.",
  },
  {
    icon: "dynamic_feed",
    title: "Telemetría operativa",
    description: "Eventos de flota, auditoría y alertas en un único bus.",
  },
];

const metrics = [
  { value: "1,428", label: "Activos gestionados" },
  { value: "94.2%", label: "Cumplimiento CIS" },
  { value: "14", label: "CVEs en revisión" },
];

export function AuthBrandPanel() {
  return (
    <aside className="relative hidden overflow-hidden bg-inverse-surface p-space-xl text-surface lg:flex lg:flex-col lg:justify-between">
      <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-primary-container/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />

      <div className="relative flex items-center gap-space-sm">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-container">
          <Icon name="layers" className="text-[20px] text-on-primary" />
        </div>
        <div className="flex flex-col">
          <span className="font-headline-sm text-headline-sm leading-none tracking-tight">
            OpsCore
          </span>
          <span className="mt-0.5 font-label-mono-xs text-label-mono-xs text-surface/60">
            ITAM v2.4
          </span>
        </div>
      </div>

      <div className="relative max-w-md">
        <div className="mb-space-md flex items-center gap-2">
          <span className="h-2 w-2 rounded bg-primary-container" />
          <span className="font-label-mono-xs text-label-mono-xs uppercase tracking-[0.2em] text-surface/60">
            Infrastructure Fleet Topology
          </span>
        </div>
        <h1 className="font-display-lg text-display-lg tracking-tight">
          Cada activo, licencia y parche bajo control.
        </h1>
        <p className="mt-space-md font-body-lg text-body-lg text-surface/70">
          La plataforma ITAM para operar el ciclo de vida completo de tu
          infraestructura: inventario, cumplimiento, aprobaciones y costos.
        </p>

        <ul className="mt-space-xl flex flex-col gap-space-md">
          {highlights.map((item) => (
            <li key={item.title} className="flex items-start gap-space-md">
              <div className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-surface/10">
                <Icon
                  name={item.icon}
                  className="text-[19px] text-primary-container"
                />
              </div>
              <div>
                <p className="font-title-md text-title-md">{item.title}</p>
                <p className="font-body-sm text-body-sm text-surface/60">
                  {item.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative grid grid-cols-3 gap-space-md border-t border-surface/10 pt-space-lg">
        {metrics.map((metric) => (
          <div key={metric.label}>
            <p className="font-headline-md text-headline-md">{metric.value}</p>
            <p className="font-label-mono-xs text-label-mono-xs text-surface/50">
              {metric.label}
            </p>
          </div>
        ))}
      </div>
    </aside>
  );
}
