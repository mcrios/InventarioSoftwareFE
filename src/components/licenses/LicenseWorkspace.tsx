"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LicenseFormModal } from "@/components/licenses/LicenseFormModal";
import { LicenseRenewalModal } from "@/components/licenses/LicenseRenewalModal";
import { LicenseStats } from "@/components/licenses/LicenseStats";
import { LicenseTable } from "@/components/licenses/LicenseTable";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Icon } from "@/components/ui/Icon";
import { companyService } from "@/lib/companyService";
import { licenseService } from "@/lib/licenseService";
import { cn, getErrorMessage } from "@/lib/utils";
import type { Empresa, Licencia, LicenciaInput, LicenciaRenovacionInput } from "@/types/api";

export function LicenseWorkspace() {
  const [licencias, setLicencias] = useState<Licencia[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [notice, setNotice] = useState<{
    message: string;
    tone: "success" | "error";
  } | null>(null);

  // Modales
  const [formOpen, setFormOpen] = useState(false);
  const [editingLicense, setEditingLicense] = useState<Licencia | null>(null);
  const [renewingLicense, setRenewingLicense] = useState<Licencia | null>(null);

  // Eliminación
  const [deletingLicense, setDeletingLicense] = useState<Licencia | null>(null);
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

  const reloadData = useCallback(async () => {
    try {
      const [licenciasPage, empresasPage] = await Promise.all([
        licenseService.listLicencias({ page: 0, size: 100 }),
        companyService.listEmpresas({ page: 0, size: 100 }),
      ]);

      setLicencias(licenciasPage.content);
      setEmpresas(empresasPage.content);
      setError(null);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      licenseService.listLicencias({ page: 0, size: 100 }),
      companyService.listEmpresas({ page: 0, size: 100 }),
    ])
      .then(([licenciasPage, empresasPage]) => {
        if (cancelled) return;
        setLicencias(licenciasPage.content);
        setEmpresas(empresasPage.content);
        setError(null);
      })
      .catch((loadError) => {
        if (!cancelled) {
          setError(getErrorMessage(loadError));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Manejador de alta y edición
  async function handleSaveLicense(payload: LicenciaInput) {
    if (editingLicense) {
      await licenseService.updateLicencia(editingLicense.id, payload);
      notify("Licencia actualizada exitosamente.", "success");
    } else {
      await licenseService.createLicencia(payload);
      notify("Licencia registrada exitosamente.", "success");
    }
    await reloadData();
    setEditingLicense(null);
    setFormOpen(false);
  }

  // Manejador de renovación
  async function handleRenewLicense(
    id: number,
    current: Licencia,
    renewal: LicenciaRenovacionInput,
  ) {
    await licenseService.renovarLicencia(id, current, renewal);
    notify("Licencia renovada exitosamente.", "success");
    await reloadData();
    setRenewingLicense(null);
  }

  // Manejador de eliminación
  async function handleConfirmDelete() {
    if (!deletingLicense) return;

    setDeletingBusy(true);

    try {
      await licenseService.deleteLicencia(deletingLicense.id);
      notify("Licencia eliminada exitosamente.", "success");
      setDeletingLicense(null);
      await reloadData();
    } catch (deleteError) {
      notify(getErrorMessage(deleteError), "error");
    } finally {
      setDeletingBusy(false);
    }
  }

  function handleOpenCreate() {
    setEditingLicense(null);
    setFormOpen(true);
  }

  function handleOpenEdit(licencia: Licencia) {
    setEditingLicense(licencia);
    setFormOpen(true);
  }

  function handleOpenRenew(licencia: Licencia) {
    setRenewingLicense(licencia);
  }

  function handleOpenDelete(licencia: Licencia) {
    setDeletingLicense(licencia);
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        eyebrow="SAM // Software Asset Management"
        title="Gestión de Licencias"
        badge={`${licencias.length} registros`}
        description="Administra los contratos de software, controla la cantidad de instalaciones permitidas por empresa y gestiona las renovaciones de vigencia."
        actions={
          <Button
            type="button"
            variant="primary"
            onClick={handleOpenCreate}
            className="gap-2"
          >
            <Icon name="add" className="text-[20px]" />
            Nueva Licencia
          </Button>
        }
      />

      {/* Alerta de notificación flotante o inline */}
      {notice && (
        <div
          role="status"
          className={cn(
            "mb-5 flex items-center justify-between gap-3 rounded-2xl p-4 text-body-sm shadow-sm transition-all",
            notice.tone === "success"
              ? "bg-surface-container-low text-on-surface ring-1 ring-primary/20"
              : "bg-error/10 text-error ring-1 ring-error/20",
          )}
        >
          <div className="flex items-center gap-2">
            <Icon
              name={notice.tone === "success" ? "check_circle" : "error"}
              className={cn(
                "text-[20px]",
                notice.tone === "success" ? "text-primary" : "text-error",
              )}
            />
            <span>{notice.message}</span>
          </div>
          <button
            type="button"
            aria-label="Cerrar notificación"
            onClick={() => setNotice(null)}
            className="rounded-lg p-1 text-secondary hover:bg-surface-container"
          >
            <Icon name="close" className="text-[16px]" />
          </button>
        </div>
      )}

      {/* Alerta de error de carga */}
      {error && (
        <Card className="mb-6 border-error/20 bg-error/5 p-4 text-error">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Icon name="error" className="text-[20px]" />
              <span className="font-body-md text-body-md">{error}</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={reloadData}
            >
              Reintentar
            </Button>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-secondary">
          <Icon name="progress_activity" className="animate-spin text-[32px] text-primary" />
          <span className="font-body-md text-body-md">Cargando inventario de licencias...</span>
        </div>
      ) : (
        <>
          <LicenseStats licencias={licencias} />

          <LicenseTable
            licencias={licencias}
            empresas={empresas}
            onEdit={handleOpenEdit}
            onRenew={handleOpenRenew}
            onDelete={handleOpenDelete}
            onNewLicense={handleOpenCreate}
          />
        </>
      )}

      {/* Modal Crear / Editar */}
      {formOpen && (
        <LicenseFormModal
          key={editingLicense ? `edit-${editingLicense.id}` : "create"}
          open={formOpen}
          onClose={() => {
            setFormOpen(false);
            setEditingLicense(null);
          }}
          onSubmit={handleSaveLicense}
          empresas={empresas}
          initialData={editingLicense}
        />
      )}

      {/* Modal Renovar */}
      {renewingLicense && (
        <LicenseRenewalModal
          key={`renew-${renewingLicense.id}`}
          open={Boolean(renewingLicense)}
          onClose={() => setRenewingLicense(null)}
          licencia={renewingLicense}
          onRenew={handleRenewLicense}
        />
      )}

      {/* Diálogo de confirmación para eliminar */}
      <ConfirmDialog
        open={Boolean(deletingLicense)}
        onCancel={() => !deletingBusy && setDeletingLicense(null)}
        onConfirm={handleConfirmDelete}
        title="¿Eliminar esta licencia?"
        description={`Estás a punto de eliminar la licencia con clave "${deletingLicense?.codigoClave || `#${deletingLicense?.id}`}" asignada a "${deletingLicense?.empresa?.nombre}". Si hay software vinculado a esta licencia, la operación podría ser rechazada.`}
        confirmLabel="Eliminar Licencia"
        loading={deletingBusy}
      />
    </div>
  );
}
