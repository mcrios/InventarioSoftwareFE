import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";

const modules = [
  {
    href: "/inventory",
    icon: "devices",
    title: "Inventario de Activos",
    description: "1,428 nodos físicos, virtuales y cloud.",
    metric: "1,428",
  },
  {
    href: "/software",
    icon: "system_update_alt",
    title: "Software y Parches",
    description: "Despliegues pendientes y ventanas de mantenimiento.",
    metric: "37",
  },
  {
    href: "/approvals",
    icon: "verified_user",
    title: "Aprobaciones",
    description: "Solicitudes de acceso y cambios en revisión.",
    metric: "12",
  },
  {
    href: "/licenses",
    icon: "key",
    title: "Gestión de Licencias",
    description: "Renovaciones, asientos y costo por proveedor.",
    metric: "94%",
  },
  {
    href: "/users",
    icon: "group",
    title: "Usuarios y Roles",
    description: "Altas, bajas y permisos del equipo de operación.",
    metric: "8",
  },
  {
    href: "/alerts",
    icon: "notifications_active",
    title: "Alertas & CVEs",
    description: "Hallazgos críticos y seguimiento de remediación.",
    metric: "14",
  },
];

export function QuickAccess() {
  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-headline-sm text-headline-sm text-on-surface">
          Accesos Rápidos
        </h2>
        <span className="font-label-mono-xs text-label-mono-xs uppercase tracking-wider text-secondary">
          Módulos del ERP
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {modules.map((module) => (
          <Link key={module.href} href={module.href} className="group">
            <Card className="flex h-full items-start gap-space-md p-4 transition-all group-hover:-translate-y-0.5 group-hover:shadow-md">
              <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-surface-container text-on-surface">
                <Icon name={module.icon} className="text-[21px]" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-title-md text-title-md text-on-surface">
                    {module.title}
                  </span>
                  <span className="font-label-mono-sm text-label-mono-sm text-primary-container">
                    {module.metric}
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-secondary">
                  {module.description}
                </p>
              </div>
              <Icon
                name="arrow_forward"
                className="mt-1 text-[18px] text-secondary transition-transform group-hover:translate-x-0.5 group-hover:text-primary-container"
              />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
