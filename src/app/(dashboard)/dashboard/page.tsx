"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EquipmentStatusChart } from "@/components/dashboard/EquipmentStatusChart";
import { ManufacturerChart } from "@/components/dashboard/ManufacturerChart";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { QuickAccess } from "@/components/dashboard/QuickAccess";
import { TelemetryFeed } from "@/components/dashboard/TelemetryFeed";
import { buttonStyles } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { equipmentService } from "@/lib/equipmentService";
import { licenseService } from "@/lib/licenseService";
import { getErrorMessage } from "@/lib/utils";
import type { Equipo, Licencia } from "@/types/api";

export default function DashboardPage() {
  const [licencias, setLicencias] = useState<Licencia[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      const results = await Promise.allSettled([
        licenseService.listLicencias({ page: 0, size: 100 }),
        equipmentService.listEquipos({
          page: 0,
          size: 200,
          sort: ["id,desc"],
        }),
      ]);

      if (cancelled) return;

      const [licenciasResult, equiposResult] = results;

      if (licenciasResult.status === "fulfilled") {
        setLicencias(licenciasResult.value.content);
      }

      if (equiposResult.status === "fulfilled") {
        setEquipos(equiposResult.value.content);
      }

      const failure = results.find(
        (result): result is PromiseRejectedResult =>
          result.status === "rejected",
      );

      setError(failure ? getErrorMessage(failure.reason) : null);
      setLoading(false);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <PageHeader
        eyebrow="ERP // Operations Overview"
        title="Panel de Control"
        badge={loading ? "Sincronizando..." : "Operación en vivo"}
        description="Resumen de la flota, cumplimiento y las tareas pendientes del ciclo de vida del software en uso."
        actions={
          <Link href="/inventory" className={buttonStyles("primary", "md")}>
            <Icon name="devices" className="text-[17px]" />
            <span>Ver inventario</span>
          </Link>
        }
      />

      {error ? (
        <div className="mb-4 flex items-start gap-2 rounded-xl bg-error-container px-4 py-2.5 font-body-sm text-body-sm text-on-error-container">
          <Icon name="error" className="mt-0.5 text-[18px]" filled />
          <span>
            No se pudieron cargar todos los datos del panel: {error}
          </span>
        </div>
      ) : null}

      {loading ? (
        <Card className="mb-6 flex min-h-[160px] items-center justify-center gap-2 p-5">
          <Icon
            name="progress_activity"
            className="animate-spin text-[22px] text-primary-container"
          />
          <span className="font-body-sm text-body-sm text-secondary">
            Cargando estado de los equipos...
          </span>
        </Card>
      ) : (
        <EquipmentStatusChart equipos={equipos} />
      )}

      <QuickAccess />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <TelemetryFeed licencias={licencias} />
        <ManufacturerChart equipos={equipos} />
      </div>
    </>
  );
}
