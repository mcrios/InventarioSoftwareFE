import Link from "next/link";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { buttonStyles } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

interface ModulePlaceholderProps {
  eyebrow: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  primaryHref?: string;
  primaryLabel?: string;
}

export function ModulePlaceholder({
  eyebrow,
  title,
  description,
  icon,
  features,
  primaryHref = "/inventory",
  primaryLabel = "Ir al inventario",
}: ModulePlaceholderProps) {
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} description={description} />

      <Card className="p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex max-w-xl flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-container text-on-surface">
                <Icon name={icon} className="text-[24px]" />
              </div>
              <span className="rounded-full bg-surface-container px-2.5 py-1 font-label-mono-xs text-label-mono-xs uppercase tracking-wider text-secondary">
                Módulo en preparación
              </span>
            </div>
            <h2 className="font-headline-md text-headline-md text-on-surface">
              La base del módulo ya está conectada al ERP
            </h2>
            <p className="font-body-md text-body-md text-secondary">
              El layout, la navegación, los componentes compartidos y el flujo
              de autenticación ya están listos. Esta vista queda preparada para
              conectar la lógica de negocio y las APIs correspondientes.
            </p>
            <Link
              href={primaryHref}
              className={cn(buttonStyles("primary", "md"), "mt-2 w-fit")}
            >
              <Icon name="arrow_back" className="text-[16px]" />
              <span>{primaryLabel}</span>
            </Link>
          </div>

          <div className="w-full max-w-md rounded-xl bg-surface-container-lowest p-4 shadow-sm">
            <p className="mb-3 font-label-mono-xs text-label-mono-xs uppercase tracking-wider text-secondary">
              Alcance previsto
            </p>
            <ul className="flex flex-col gap-2.5">
              {features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2 font-body-sm text-body-sm text-on-surface"
                >
                  <Icon
                    name="check_circle"
                    className="mt-0.5 text-[17px] text-primary-container"
                    filled
                  />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    </>
  );
}
