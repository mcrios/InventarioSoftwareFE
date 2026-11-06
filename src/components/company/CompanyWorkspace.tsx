"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CompanyFormModal } from "@/components/company/CompanyFormModal";
import { CompanyStats } from "@/components/company/CompanyStats";
import { CompanyTable } from "@/components/company/CompanyTable";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Icon } from "@/components/ui/Icon";
import { companyService } from "@/lib/companyService";
import { cn, getErrorMessage } from "@/lib/utils";
import type { Empresa, EmpresaInput } from "@/types/api";

export function CompanyWorkspace() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{
    message: string;
    tone: "success" | "error";
  } | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<Empresa | null>(null);
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

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const page = await companyService.listEmpresas({ page: 0, size: 100 });
      setEmpresas(page.content);
      setError(null);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    companyService
      .listEmpresas({ page: 0, size: 100 })
      .then((page) => {
        if (cancelled) return;
        setEmpresas(page.content);
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

      if (noticeTimer.current) {
        window.clearTimeout(noticeTimer.current);
      }
    };
  }, []);

  async function handleCreate(input: EmpresaInput) {
    const created = await companyService.createEmpresa(input);

    setEmpresas((current) => [created, ...current]);
    notify("Empresa creada correctamente.");
  }

  async function handleUpdate(id: number, input: EmpresaInput) {
    const updated = await companyService.updateEmpresa(id, input);

    setEmpresas((current) =>
      current.map((empresa) => (empresa.id === id ? updated : empresa)),
    );
    notify("Cambios guardados correctamente.");
  }

  async function handleDelete() {
    if (!deleting) return;

    setDeletingBusy(true);

    try {
      await companyService.deleteEmpresa(deleting.id);
      setEmpresas((current) =>
        current.filter((empresa) => empresa.id !== deleting.id),
      );
      setDeleting(null);
      notify("Empresa eliminada correctamente.");
    } catch (deleteError) {
      setDeleting(null);
      notify(getErrorMessage(deleteError), "error");
    } finally {
      setDeletingBusy(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Administración // Gestión Multiempresa"
        title="Mantenimiento de Empresas"
        badge={`${empresas.length} empresas`}
        description="Administra las empresas registradas en la plataforma. Haz doble clic sobre una celda para editarla y guarda los cambios directamente en la fila."
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
            </div>

            <Button
              variant="secondary"
              onClick={() => void load()}
              disabled={loading}
            >
              <Icon
                name={loading ? "progress_activity" : "refresh"}
                className={cn("text-[17px]", loading && "animate-spin")}
              />
              <span>Actualizar</span>
            </Button>

            <Button onClick={() => setFormOpen(true)} disabled={loading}>
              <Icon name="add_business" className="text-[18px]" />
              <span>Nueva empresa</span>
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
                No se pudo cargar el listado de empresas
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
            Cargando empresas registradas...
          </span>
        </Card>
      ) : (
        <>
          <CompanyStats empresas={empresas} />
          <CompanyTable
            empresas={empresas}
            onUpdate={handleUpdate}
            onDelete={setDeleting}
          />
        </>
      )}

      {formOpen ? (
        <CompanyFormModal
          open
          onClose={() => setFormOpen(false)}
          onCreate={handleCreate}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Eliminar empresa"
        description={
          deleting
            ? `Se eliminará la empresa ${deleting.nombre}${
                deleting.identificador
                  ? ` (${deleting.identificador})`
                  : ""
              }.`
            : ""
        }
        loading={deletingBusy}
        onCancel={() => setDeleting(null)}
        onConfirm={() => void handleDelete()}
      />
    </>
  );
}
