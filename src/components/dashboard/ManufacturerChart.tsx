import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { manufacturers } from "@/lib/inventory";

export function ManufacturerChart() {
  const [dell, apple, lenovo] = manufacturers;

  return (
    <Card className="flex flex-col justify-between p-5 xl:col-span-5">
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <Icon name="pie_chart" className="text-[20px] text-secondary" />
          <h2 className="font-headline-sm text-headline-sm text-on-surface">
            Distribución por Fabricante
          </h2>
        </div>
        <span className="font-label-mono-xs text-label-mono-xs text-secondary">
          Q2 2025
        </span>
      </div>

      <div className="my-2 flex items-center gap-6">
        <svg
          className="h-28 w-28 flex-shrink-0 -rotate-90"
          viewBox="0 0 36 36"
          aria-label="Distribución de activos por fabricante"
        >
          <path
            className="text-surface-container"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
          />
          <path
            className="text-on-surface"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeDasharray={`${dell.percentage}, 100`}
            strokeWidth="3.5"
          />
          <path
            className="text-primary-container"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeDasharray={`${apple.percentage}, 100`}
            strokeDashoffset={apple.dashOffset}
            strokeWidth="3.5"
          />
          <path
            className="text-secondary"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeDasharray={`${lenovo.percentage}, 100`}
            strokeDashoffset={lenovo.dashOffset}
            strokeWidth="3.5"
          />
        </svg>

        <div className="flex flex-1 flex-col gap-2">
          {manufacturers.map((manufacturer) => (
            <div
              key={manufacturer.id}
              className="flex items-center justify-between gap-2 font-title-md text-body-sm"
            >
              <span className="flex items-center gap-1.5 text-on-surface">
                <span
                  className={`h-2.5 w-2.5 rounded-sm ${manufacturer.color}`}
                />
                {manufacturer.name}
              </span>
              <span className="whitespace-nowrap font-code-md text-code-md text-secondary">
                {manufacturer.nodes}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-3">
        <span className="font-label-mono-xs text-label-mono-xs text-secondary">
          Cumplimiento CIS Benchmark: 94.2%
        </span>
        <button
          type="button"
          aria-label="Ajustar visualización"
          className="rounded-lg p-1 text-secondary transition-colors hover:bg-surface-container hover:text-on-surface"
        >
          <Icon name="tune" className="text-[18px]" />
        </button>
      </div>
    </Card>
  );
}
