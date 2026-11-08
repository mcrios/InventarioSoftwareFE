"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EquipmentDetailModal } from "@/components/equipment/EquipmentDetailModal";
import { EquipmentFormModal } from "@/components/equipment/EquipmentFormModal";
import { EquipmentStats } from "@/components/equipment/EquipmentStats";
import { EquipmentTable } from "@/components/equipment/EquipmentTable";
import {
  buildLatestUpdates,
  type SoftwareAssignment,
} from "@/components/equipment/equipmentSoftware";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Icon } from "@/components/ui/Icon";
import { companyService } from "@/lib/companyService";
import { equipmentService } from "@/lib/equipmentService";
import { securityService } from "@/lib/securityService";
import { softwareService, updateService } from "@/lib/softwareService";
import { cn, getErrorMessage } from "@/lib/utils";
import type {
  Actualizacion,
  Empresa,
  Equipo,
  EquipoInput,
  EquipoSoftware,
  Page,
  Software,
  Usuario,
} from "@/types/api";

type EquipmentLoadResults = [
  PromiseSettledResult<Page<Equipo>>,
  PromiseSettledResult<Page<Empresa>>,
  PromiseSettledResult<Page<Usuario>>,
  PromiseSettledResult<Page<EquipoSoftware>>,
  PromiseSettledResult<Page<Software>>,
  PromiseSettledResult<Page<Actualizacion>>,
];

function failedAssignmentsMessage(
  results: PromiseSettledResult<EquipoSoftware>[],
) {
  const rejected = results.find(
    (result): result is PromiseRejectedResult => result.status === "rejected",
  );

  return rejected ? getErrorMessage(rejected.reason) : null;
}

export function EquipmentWorkspace() {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [instalaciones, setInstalaciones] = useState<EquipoSoftware[]>([]);
  const [software, setSoftware] = useState<Software[]>([]);
  const [actualizaciones, setActualizaciones] = useState<Actualizacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{
    message: string;
    tone: "success" | "error";
  } | null>(null);
  const [formTarget, setFormTarget] = useState<Equipo | "new" | null>(null);
  const [detailTarget, setDetailTarget] = useState<Equipo | null>(null);
  const [deleting, setDeleting] = useState<Equipo | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);

  const noticeTimer = useRef<number | null>(null);

  const notify = useCallback(
    (message: string, tone: "success" | "error" = "success") => {
      setNotice({ message, tone });

      if (noticeTimer.current) {
        window.clearTimeout(noticeTimer.current);
      }

      noticeTimer.current = window.setTimeout(() => {
        setNotice(null);
      }, 4000);
    },
    [],
  );

  const fetchAll = useCallback(
    async (): Promise<EquipmentLoadResults> =>
      Promise.allSettled([
        equipmentService.listEquipos({
          page: 0,
          size: 100,
          sort: ["id,desc"],
        }),
        companyService.listEmpresas({ page: 0, size: 100 }),
        securityService.listUsuarios({ page: 0, size: 100 }),
        equipmentService.listEquipoSoftware({
          page: 0,
          size: 200,
          sort: ["id,desc"],
        }),
        softwareService.listSoftware({ page: 0, size: 200 }),
        updateService.listActualizaciones({ page: 0, size: 200 }),
      ]),
    [],
  );

  const applyResults = useCallback((results: EquipmentLoadResults) => {
    const [
      equiposResult,
      empresasResult,
      usuariosResult,
      instalacionesResult,
      softwareResult,
      actualizacionesResult,
    ] = results;

    if (equiposResult.status === "rejected") {
      setError(getErrorMessage(equiposResult.reason));
      return;
    }

    setEquipos(equiposResult.value.content);

    if (empresasResult.status === "fulfilled") {
      setEmpresas(empresasResult.value.content);
    }

    if (usuariosResult.status === "fulfilled") {
      setUsuarios(usuariosResult.value.content);
    }

    if (instalacionesResult.status === "fulfilled") {
      setInstalaciones(instalacionesResult.value.content);
    }

    if (softwareResult.status === "fulfilled") {
      setSoftware(softwareResult.value.content);
    }

    if (actualizacionesResult.status === "fulfilled") {
      setActualizaciones(actualizacionesResult.value.content);
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

    return () => {
      cancelled = true;

      if (noticeTimer.current) {
        window.clearTimeout(noticeTimer.current);
      }
    };
  }, [applyResults, fetchAll]);

  const latestUpdates = useMemo(
    () => buildLatestUpdates(actualizaciones),
    [actualizaciones],
  );

  const detailInstalaciones = useMemo(
    () =>
      detailTarget
        ? instalaciones.filter(
            (instalacion) => instalacion.equipo.id === detailTarget.id,
          )
        : [],
    [detailTarget, instalaciones],
  );

  async function handleSubmit(
    input: EquipoInput,
    assignments: SoftwareAssignment[],
  ) {
    if (formTarget && formTarget !== "new") {
      const updated = await equipmentService.updateEquipo(
        formTarget.id,
        input,
      );

      setEquipos((current) =>
        current.map((equipo) => (equipo.id === updated.id ? updated : equipo)),
      );
      notify("Equipo actualizado correctamente.");
      return;
    }

    const created = await equipmentService.createEquipo(input);

    setEquipos((current) => [created, ...current]);

    if (!assignments.length) {
      notify("Equipo registrado correctamente.");
      return;
    }

    const results = await Promise.allSettled(
      assignments.map((assignment) =>
        equipmentService.createEquipoSoftware({
          equipo: { id: created.id },
          software: { id: assignment.softwareId },
          licencia: assignment.licenciaId
            ? { id: assignment.licenciaId }
            : null,
          versionInstalada: assignment.versionInstalada,
        }),
      ),
    );

    const createdInstalaciones = results.flatMap((result) =>
      result.status === "fulfilled" ? [result.value] : [],
    );

    if (createdInstalaciones.length) {
      setInstalaciones((current) => [...createdInstalaciones, ...current]);
    }

    const failure = failedAssignmentsMessage(results);

    if (failure) {
      notify(
        `Equipo creado, pero no se pudo asignar todo el software: ${failure}`,
        "error",
      );
      return;
    }

    notify(
      `Equipo registrado con ${createdInstalaciones.length} software instalado${
        createdInstalaciones.length === 1 ? "" : "s"
      }.`,
    );
  }

  async function handleAssignSoftware(assignments: SoftwareAssignment[]) {
    const equipo = detailTarget;

    if (!equipo) return;

    const results = await Promise.allSettled(
      assignments.map((assignment) =>
        equipmentService.createEquipoSoftware({
          equipo: { id: equipo.id },
          software: { id: assignment.softwareId },
          licencia: assignment.licenciaId
            ? { id: assignment.licenciaId }
            : null,
          versionInstalada: assignment.versionInstalada,
        }),
      ),
    );

    const createdInstalaciones = results.flatMap((result) =>
      result.status === "fulfilled" ? [result.value] : [],
    );

    if (createdInstalaciones.length) {
      setInstalaciones((current) => [...createdInstalaciones, ...current]);
    }

    const failure = failedAssignmentsMessage(results);

    if (failure) {
      throw new Error(failure);
    }

    notify(
      `Se asignaron ${createdInstalaciones.length} software al equipo ${equipo.nombre}.`,
    );
  }

  async function handleRemoveSoftware(instalacion: EquipoSoftware) {
    await equipmentService.deleteEquipoSoftware(instalacion.id);

    setInstalaciones((current) =>
      current.filter((item) => item.id !== instalacion.id),
    );
    notify(`Se quitó ${instalacion.software.nombre} del equipo.`);
  }

  async function handleDelete() {
    if (!deleting) return;

    setDeletingBusy(true);

    try {
      const related = instalaciones.filter(
        (instalacion) => instalacion.equipo.id === deleting.id,
      );

      await Promise.allSettled(
        related.map((instalacion) =>
          equipmentService.deleteEquipoSoftware(instalacion.id),
        ),
      );
      await equipmentService.deleteEquipo(deleting.id);

      setEquipos((current) =>
        current.filter((equipo) => equipo.id !== deleting.id),
      );
      setInstalaciones((current) =>
        current.filter((instalacion) => instalacion.equipo.id !== deleting.id),
      );
      setDetailTarget((current) =>
        current?.id === deleting.id ? null : current,
      );
      setDeleting(null);
      notify("Equipo eliminado correctamente.");
    } catch (deleteError) {
      setDeleting(null);
      notify(getErrorMessage(deleteError), "error");
    } finally {
      setDeletingBusy(false);
    }
  }

  function exportCsv() {
    const installedByEquipment = new Map<number, string[]>();

    instalaciones.forEach((instalacion) => {
      const list = installedByEquipment.get(instalacion.equipo.id) ?? [];

      list.push(
        `${instalacion.software.nombre} v${instalacion.versionInstalada}`,
      );
      installedByEquipment.set(instalacion.equipo.id, list);
    });

    const rows = equipos.map((equipo) => [
      equipo.nombre,
      equipo.empresa.nombre,
      equipo.tipo,
      equipo.fabricante ?? "",
      equipo.ip ?? "",
      equipo.ubicacion ?? "",
      equipo.responsable?.nombre ?? "",
      equipo.salud ?? "",
      (installedByEquipment.get(equipo.id) ?? []).join(" | "),
      equipo.fechaCreacion,
    ]);

    const csv = [
      [
        "Equipo",
        "Empresa",
        "Tipo",
        "Fabricante",
        "IP",
        "Ubicación",
        "Responsable",
        "Salud",
        "Software instalado",
        "Fecha de alta",
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
    link.download = "inventario-equipos.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <PageHeader
        eyebrow="ITAM // Inventario de Equipos"
        title="Inventario de Equipos"
        badge={`${equipos.length} equipos`}
        description="Administra los equipos de cada empresa, su responsable y su estado de salud. Cada equipo puede asociarse al software y las licencias que tenga instalados."
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
                {loading ? "Sincronizando..." : "Datos sincronizados"}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => void load()}
                disabled={loading}
                aria-label="Actualizar inventario"
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
              disabled={!equipos.length}
            >
              <Icon name="download" className="text-[17px]" />
              <span>Exportar CSV</span>
            </Button>

            <Button
              onClick={() => setFormTarget("new")}
              disabled={loading || empresas.length === 0}
              title={
                empresas.length === 0
                  ? "Registra una empresa antes de dar de alta equipos"
                  : undefined
              }
            >
              <Icon name="add" className="text-[18px]" />
              <span>Nuevo equipo</span>
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
                No se pudo cargar el inventario de equipos
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

      {loading ? (
        <Card className="flex min-h-[280px] flex-col items-center justify-center gap-3 p-8">
          <Icon
            name="progress_activity"
            className="animate-spin text-[28px] text-primary-container"
          />
          <span className="font-body-sm text-body-sm text-secondary">
            Cargando equipos registrados...
          </span>
        </Card>
      ) : (
        <>
          <EquipmentStats
            equipos={equipos}
            instalaciones={instalaciones}
            actualizaciones={actualizaciones}
          />
          <EquipmentTable
            equipos={equipos}
            instalaciones={instalaciones}
            latestUpdates={latestUpdates}
            onView={setDetailTarget}
            onEdit={setFormTarget}
            onDelete={setDeleting}
          />
        </>
      )}

      {formTarget ? (
        <EquipmentFormModal
          open
          equipo={formTarget === "new" ? null : formTarget}
          empresas={empresas}
          usuarios={usuarios}
          software={software}
          onClose={() => setFormTarget(null)}
          onSubmit={handleSubmit}
        />
      ) : null}

      {detailTarget ? (
        <EquipmentDetailModal
          equipo={detailTarget}
          instalaciones={detailInstalaciones}
          latestUpdates={latestUpdates}
          software={software}
          onAssign={handleAssignSoftware}
          onRemove={handleRemoveSoftware}
          onClose={() => setDetailTarget(null)}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Eliminar equipo"
        description={
          deleting
            ? `Se eliminará el equipo ${deleting.nombre} de ${deleting.empresa.nombre} junto con su software instalado. Esta acción no se puede deshacer.`
            : ""
        }
        loading={deletingBusy}
        onCancel={() => setDeleting(null)}
        onConfirm={() => void handleDelete()}
      />
    </>
  );
}
