"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DeploymentRequestModal } from "@/components/software/DeploymentRequestModal";
import { SoftwareFormModal } from "@/components/software/SoftwareFormModal";
import { SoftwareStats } from "@/components/software/SoftwareStats";
import { SoftwareTable } from "@/components/software/SoftwareTable";
import { SoftwareUpdateModal } from "@/components/software/SoftwareUpdateModal";
import {
  buildLatestUpdates,
  compareVersions,
} from "@/components/equipment/equipmentSoftware";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { approvalService } from "@/lib/approvalService";
import { equipmentService } from "@/lib/equipmentService";
import { licenseService } from "@/lib/licenseService";
import { resolveCurrentUser } from "@/lib/session";
import { softwareService, updateService } from "@/lib/softwareService";
import { cn, getErrorMessage } from "@/lib/utils";
import type {
  Actualizacion,
  ActualizacionInput,
  Equipo,
  EquipoSoftware,
  Licencia,
  Page,
  Software,
  SoftwareInput,
  SolicitudActualizacion,
  SolicitudActualizacionInput,
  TipoSoftware,
  Usuario,
} from "@/types/api";

type SoftwareLoadResults = [
  PromiseSettledResult<Page<Software>>,
  PromiseSettledResult<Page<Licencia>>,
  PromiseSettledResult<Page<Actualizacion>>,
  PromiseSettledResult<Page<Equipo>>,
  PromiseSettledResult<Page<EquipoSoftware>>,
  PromiseSettledResult<Page<SolicitudActualizacion>>,
  PromiseSettledResult<TipoSoftware[]>,
];

export function SoftwareWorkspace() {
  const [software, setSoftware] = useState<Software[]>([]);
  const [licencias, setLicencias] = useState<Licencia[]>([]);
  const [actualizaciones, setActualizaciones] = useState<Actualizacion[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [instalaciones, setInstalaciones] = useState<EquipoSoftware[]>([]);
  const [solicitudes, setSolicitudes] = useState<SolicitudActualizacion[]>([]);
  const [tiposSoftware, setTiposSoftware] = useState<TipoSoftware[]>([]);
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{
    message: string;
    tone: "success" | "error";
  } | null>(null);

  const [formTarget, setFormTarget] = useState<Software | "new" | null>(null);
  const [updateTarget, setUpdateTarget] = useState<Software | null>(null);
  const [deploymentTarget, setDeploymentTarget] = useState<Software | null>(
    null,
  );

  const noticeTimer = useRef<number | null>(null);

  const notify = useCallback(
    (message: string, tone: "success" | "error" = "success") => {
      setNotice({ message, tone });

      if (noticeTimer.current) {
        window.clearTimeout(noticeTimer.current);
      }

      noticeTimer.current = window.setTimeout(() => {
        setNotice(null);
      }, 5000);
    },
    [],
  );

  const fetchAll = useCallback(
    async (): Promise<SoftwareLoadResults> =>
      Promise.allSettled([
        softwareService.listSoftware({
          page: 0,
          size: 200,
          sort: ["id,desc"],
        }),
        licenseService.listLicencias({ page: 0, size: 200 }),
        updateService.listActualizaciones({
          page: 0,
          size: 300,
          sort: ["id,desc"],
        }),
        equipmentService.listEquipos({ page: 0, size: 200 }),
        equipmentService.listEquipoSoftware({ page: 0, size: 500 }),
        approvalService.listSolicitudes({ page: 0, size: 200 }),
        softwareService.listTiposSoftware(),
      ]),
    [],
  );

  const applyResults = useCallback((results: SoftwareLoadResults) => {
    const [
      softwareResult,
      licenciasResult,
      actualizacionesResult,
      equiposResult,
      instalacionesResult,
      solicitudesResult,
      tiposResult,
    ] = results;

    if (softwareResult.status === "rejected") {
      setError(getErrorMessage(softwareResult.reason));
      return;
    }

    setSoftware(softwareResult.value.content);

    if (licenciasResult.status === "fulfilled") {
      setLicencias(licenciasResult.value.content);
    }

    if (actualizacionesResult.status === "fulfilled") {
      setActualizaciones(actualizacionesResult.value.content);
    }

    if (equiposResult.status === "fulfilled") {
      setEquipos(equiposResult.value.content);
    }

    if (instalacionesResult.status === "fulfilled") {
      setInstalaciones(instalacionesResult.value.content);
    }

    if (solicitudesResult.status === "fulfilled") {
      setSolicitudes(solicitudesResult.value.content);
    }

    if (tiposResult.status === "fulfilled") {
      setTiposSoftware(tiposResult.value);
    }

    setError(null);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);

    try {
      applyResults(await fetchAll());
    } finally {
      setLoading(false);
    }
  }, [applyResults, fetchAll]);

  useEffect(() => {
    let cancelled = false;

    fetchAll()
      .then((results) => {
        if (!cancelled) applyResults(results);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    resolveCurrentUser()
      .then((usuario) => {
        if (!cancelled) setCurrentUser(usuario);
      })
      .finally(() => {
        if (!cancelled) setUserLoading(false);
      });

    return () => {
      cancelled = true;

      if (noticeTimer.current) {
        window.clearTimeout(noticeTimer.current);
      }
    };
  }, [applyResults, fetchAll]);

  const empresaIds = useMemo(
    () => new Set(currentUser?.empresas?.map((empresa) => empresa.id) ?? []),
    [currentUser],
  );

  /** Licencias visibles para el alta: solo las empresas del usuario en sesión. */
  const licenciasUsuario = useMemo(
    () =>
      licencias
        .filter((licencia) => empresaIds.has(licencia.empresa.id))
        .sort((a, b) =>
          a.empresa.nombre.localeCompare(b.empresa.nombre, "es"),
        ),
    [empresaIds, licencias],
  );

  const latestUpdates = useMemo(
    () => buildLatestUpdates(actualizaciones),
    [actualizaciones],
  );

  const updatesBySoftware = useMemo(() => {
    const map = new Map<number, Actualizacion[]>();

    actualizaciones.forEach((actualizacion) => {
      const softwareId = actualizacion.software?.id;

      if (!softwareId) return;

      const list = map.get(softwareId);

      if (list) {
        list.push(actualizacion);
      } else {
        map.set(softwareId, [actualizacion]);
      }
    });

    map.forEach((list) => {
      list.sort((a, b) => compareVersions(b.versionDestino, a.versionDestino));
    });

    return map;
  }, [actualizaciones]);

  async function handleSaveSoftware(input: SoftwareInput, id: number | null) {
    if (id) {
      const updated = await softwareService.updateSoftware(id, input);

      setSoftware((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      notify("Software actualizado correctamente.");
      return;
    }

    const created = await softwareService.createSoftware(input);

    setSoftware((current) => [created, ...current]);
    notify(`Software ${created.nombre} registrado correctamente.`);
  }

  async function handleCreateUpdate(input: ActualizacionInput) {
    const created = await updateService.createActualizacion(input);

    setActualizaciones((current) => [created, ...current]);
    notify(
      `Actualización v${created.versionDestino} publicada para ${
        created.software?.nombre ?? "el software"
      }.`,
    );
  }

  async function handleDeploymentRequest(
    payload: SolicitudActualizacionInput,
    equipoIds: number[],
  ) {
    const created = await approvalService.createSolicitud(payload);

    setSolicitudes((current) => [created, ...current]);

    if (equipoIds.length) {
      const results = await Promise.allSettled(
        equipoIds.map((equipoId) =>
          approvalService.createSolicitudEquipo({
            solicitud: { id: created.id },
            equipo: { id: equipoId },
            estadoEjecucion: "PENDIENTE",
          }),
        ),
      );

      const failed = results.filter(
        (result) => result.status === "rejected",
      ).length;

      if (failed) {
        notify(
          `Solicitud #${created.id} creada, pero ${failed} equipo${
            failed === 1 ? "" : "s"
          } no se pudieron vincular.`,
          "error",
        );
        return;
      }
    }

    notify(
      `Solicitud #${created.id} enviada a aprobación para ${
        equipoIds.length
          ? `${equipoIds.length} equipo${equipoIds.length === 1 ? "" : "s"}`
          : "despliegue general"
      }.`,
    );
  }

  function handleRequestDeployment(item: Software) {
    if (!currentUser) {
      notify(
        "No se pudo identificar al usuario en sesión. Vuelve a iniciar sesión.",
        "error",
      );
      return;
    }

    setDeploymentTarget(item);
  }

  function exportCsv() {
    const rows = software.map((item) => {
      const updates = updatesBySoftware.get(item.id) ?? [];
      const latest = latestUpdates.get(item.id);

      return [
        item.nombre,
        item.fabricante ?? "",
        item.tipoSoftware?.nombre ?? "",
        item.licencia.empresa.nombre,
        `Licencia #${item.licencia.id}`,
        item.versionActual,
        latest?.versionDestino ?? "",
        updates.length,
        item.licencia.fechaVencimiento ?? "",
      ];
    });

    const csv = [
      [
        "Software",
        "Fabricante",
        "Tipo",
        "Empresa",
        "Licencia",
        "Versión actual",
        "Última actualización",
        "Actualizaciones publicadas",
        "Vencimiento de licencia",
      ],
      ...rows,
    ]
      .map((row) =>
        row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","),
      )
      .join("\n");

    const blob = new Blob([`\uFEFF${csv}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "catalogo-software.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  const canCreate =
    !loading &&
    !userLoading &&
    licenciasUsuario.length > 0 &&
    tiposSoftware.length > 0;

  const createDisabledReason = userLoading
    ? "Cargando la sesión del usuario..."
    : licenciasUsuario.length === 0
      ? "Tu usuario no tiene licencias de empresas disponibles"
      : tiposSoftware.length === 0
        ? "No hay tipos de software registrados"
        : undefined;

  return (
    <>
      <PageHeader
        eyebrow="ITAM // Catálogo de Software y Parches"
        title="Software y Parches"
        badge={`${software.length} software`}
        description="Administra el catálogo de software, publica actualizaciones y solicita el despliegue sobre los equipos de la empresa."
        actions={
          <>
            <div className="flex items-center gap-2 rounded-full bg-surface-container-low px-3 py-1.5 shadow-sm">
              <span
                className={cn(
                  "h-2 w-2 rounded-full bg-primary-container",
                  loading && "animate-pulse",
                )}
              />
              <span className="font-label-mono-xs text-label-mono-xs text-secondary">
                {loading ? "Sincronizando..." : "Catálogo sincronizado"}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => void load()}
                disabled={loading}
                aria-label="Actualizar catálogo de software"
                className="ml-1 p-0.5"
              >
                <Icon
                  name={loading ? "progress_activity" : "refresh"}
                  className={cn("text-[15px]", loading && "animate-spin")}
                />
              </Button>
            </div>

            <Button
              variant="secondary"
              onClick={exportCsv}
              disabled={!software.length}
            >
              <Icon name="download" className="text-[17px]" />
              <span>Exportar CSV</span>
            </Button>

            <Button
              onClick={() => setFormTarget("new")}
              disabled={!canCreate}
              title={createDisabledReason}
            >
              <Icon name="add" className="text-[18px]" />
              <span>Nuevo software</span>
            </Button>
          </>
        }
      />

      {notice ? (
        <div
          className={cn(
            "mb-4 flex items-center gap-2 rounded-xl px-4 py-2.5 font-body-sm text-body-sm",
            notice.tone === "success"
              ? "bg-secondary-container text-on-secondary-container"
              : "bg-error-container text-on-error-container",
          )}
        >
          <Icon
            name={notice.tone === "success" ? "check_circle" : "error"}
            className="text-[18px]"
            filled
          />
          <span>{notice.message}</span>
        </div>
      ) : null}

      {error ? (
        <Card className="mb-4 flex flex-col gap-3 border border-error-container p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2 text-on-error-container">
            <Icon name="error" className="mt-0.5 text-[18px]" filled />
            <div className="flex flex-col">
              <span className="font-title-md text-body-sm">
                No se pudo cargar el catálogo de software
              </span>
              <span className="font-body-sm text-body-sm">{error}</span>
            </div>
          </div>
          <Button variant="secondary" onClick={() => void load()}>
            <Icon name="refresh" className="text-[17px]" />
            <span>Reintentar</span>
          </Button>
        </Card>
      ) : null}

      <div className="mb-4 flex items-start gap-2 rounded-xl bg-surface-container-low px-4 py-2.5 font-body-sm text-body-sm text-secondary">
        <Icon name="info" className="mt-0.5 text-[18px]" />
        <span>
          Al registrar software solo verás las licencias de las empresas
          asignadas a tu usuario en sesión. Las actualizaciones publicadas aquí
          son las que luego se solicitan para despliegue y se aprueban en el
          módulo de aprobaciones.
        </span>
      </div>

      {loading ? (
        <Card className="flex min-h-[280px] flex-col items-center justify-center gap-3 p-8">
          <Icon
            name="progress_activity"
            className="animate-spin text-[28px] text-primary-container"
          />
          <span className="font-body-sm text-body-sm text-secondary">
            Cargando catálogo de software...
          </span>
        </Card>
      ) : (
        <>
          <SoftwareStats
            software={software}
            actualizaciones={actualizaciones}
            instalaciones={instalaciones}
            solicitudes={solicitudes}
          />
          <SoftwareTable
            software={software}
            actualizaciones={actualizaciones}
            latestUpdates={latestUpdates}
            solicitudes={solicitudes}
            onEdit={setFormTarget}
            onCreateUpdate={setUpdateTarget}
            onRequestDeployment={handleRequestDeployment}
          />
        </>
      )}

      {formTarget ? (
        <SoftwareFormModal
          open
          software={formTarget === "new" ? null : formTarget}
          licencias={licenciasUsuario}
          tiposSoftware={tiposSoftware}
          onClose={() => setFormTarget(null)}
          onSubmit={handleSaveSoftware}
        />
      ) : null}

      {updateTarget ? (
        <SoftwareUpdateModal
          software={updateTarget}
          onClose={() => setUpdateTarget(null)}
          onSubmit={handleCreateUpdate}
        />
      ) : null}

      {deploymentTarget ? (
        <DeploymentRequestModal
          software={deploymentTarget}
          updates={updatesBySoftware.get(deploymentTarget.id) ?? []}
          equipos={equipos}
          instalaciones={instalaciones}
          currentUser={currentUser}
          onClose={() => setDeploymentTarget(null)}
          onSubmit={handleDeploymentRequest}
        />
      ) : null}
    </>
  );
}
