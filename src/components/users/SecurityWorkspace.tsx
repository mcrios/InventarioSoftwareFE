"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { AccesosPanel } from "@/components/users/AccesosPanel";
import { RolesPanel } from "@/components/users/RolesPanel";
import { UsersPanel } from "@/components/users/UsersPanel";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { securityService } from "@/lib/securityService";
import { cn, getErrorMessage } from "@/lib/utils";
import type { Acceso, Empresa, EmpresaInput, Rol, Usuario } from "@/types/api";
import { companyService } from "@/lib/companyService";
import { CompanyTable } from "../company/CompanyTable";

type TabKey = "usuarios" | "roles" | "accesos" | "empresas";

interface TabDefinition {
  key: TabKey;
  label: string;
  icon: string;
}

const tabs: TabDefinition[] = [
  { key: "usuarios", label: "Usuarios", icon: "group" },
  { key: "roles", label: "Roles", icon: "shield_person" },
  { key: "accesos", label: "Accesos", icon: "key" },
  { key: "empresas", label: "Empresas", icon: "corporate_fare" },
];

export function SecurityWorkspace() {
  const [tab, setTab] = useState<TabKey>("usuarios");
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [accesos, setAccesos] = useState<Acceso[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{
    message: string;
    tone: "success" | "error";
  } | null>(null);
  const noticeTimer = useRef<number | null>(null);

  const fetchAll = useCallback(async () => {
    const [userPage, roleList, accessList, companyList] = await Promise.all([
      securityService.listUsuarios(),
      securityService.listRoles(),
      securityService.listAccesos(),
      companyService.listEmpresas()
    ]);

    return { userPage, roleList, accessList, companyList };
  }, []);

  const applyData = useCallback(
    (data: Awaited<ReturnType<typeof fetchAll>>) => {
      setUsuarios(data.userPage.content);
      setRoles(data.roleList);
      setAccesos(data.accessList);
      setEmpresas(data.companyList.content);
    },
    [],
  );

  const load = useCallback(async () => {
    setLoading(true);

    try {
      applyData(await fetchAll());
      setError(null);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, [applyData, fetchAll]);

  useEffect(() => {
    let cancelled = false;

    fetchAll()
      .then((data) => {
        if (cancelled) return;
        applyData(data);
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
  }, [applyData, fetchAll]);

  useEffect(() => {
    return () => {
      if (noticeTimer.current) {
        window.clearTimeout(noticeTimer.current);
      }
    };
  }, []);

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

  //CRUD EMPRESA
  async function handleUpdate(id: number, input: EmpresaInput) {
      const updated = await companyService.updateEmpresa(id, input);
  
      setEmpresas((current) =>
        current.map((empresa) => (empresa.id === id ? updated : empresa)),
      );
      notify("Cambios guardados correctamente.");
    }
  
    async function handleDelete(empresa: Empresa) {
      if (!empresa) return;

      setLoading(true);

      try {
        await companyService.deleteEmpresa(empresa.id);
        setEmpresas((current) =>
          current.filter((empresa) => empresa.id !== empresa.id),
        );
        notify("Empresa eliminada correctamente.");
      } catch (deleteError) {
        notify(getErrorMessage(deleteError), "error");
      } finally{
        setLoading(false)
      }
    }

  const counts: Record<TabKey, number> = {
    usuarios: usuarios.length,
    roles: roles.length,
    accesos: accesos.length,
    empresas: empresas.length,
  };

  return (
    <>
      <PageHeader
        eyebrow="Administración // Seguridad"
        title="Seguridad y Accesos"
        badge={`${usuarios.length} cuentas`}
        description="Administra usuarios, roles y permisos. Asigna accesos a los roles y roles a los usuarios."
      />

      <div
        role="tablist"
        aria-label="Secciones de seguridad"
        className="mb-4 flex flex-wrap items-center gap-2 border-b border-surface-variant pb-2"
      >
        {tabs.map((definition) => {
          const active = tab === definition.key;

          return (
            <button
              key={definition.key}
              id={`tab-${definition.key}`}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls={`panel-${definition.key}`}
              onClick={() => setTab(definition.key)}
              className={cn(
                "flex items-center gap-2 rounded-xl px-3.5 py-2 font-title-md text-body-sm transition-colors",
                active
                  ? "bg-dark text-on-dark shadow-sm"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
              )}
            >
              <Icon name={definition.icon} className="text-[18px]" />
              <span>{definition.label}</span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 font-label-mono-xs text-label-mono-xs",
                  active
                    ? "bg-on-dark/15 text-on-dark"
                    : "bg-surface-container text-secondary",
                )}
              >
                {counts[definition.key]}
              </span>
            </button>
          );
        })}
      </div>

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
                No se pudo cargar el módulo de seguridad
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

      <div
        id={`panel-${tab}`}
        role="tabpanel"
        aria-labelledby={`tab-${tab}`}
      >
        {loading ? (
          <Card className="flex min-h-[280px] flex-col items-center justify-center gap-3 p-8">
            <Icon
              name="progress_activity"
              className="animate-spin text-[28px] text-primary-container"
            />
            <span className="font-body-sm text-body-sm text-secondary">
              Cargando usuarios, roles y accesos...
            </span>
          </Card>
        ) : tab === "usuarios" ? (
          <UsersPanel
            usuarios={usuarios} 
            roles={roles}
            empresas={empresas}
            onRefresh={load}
            notify={notify}
          />
        ) : tab === "roles" ? (
          <RolesPanel
            roles={roles}
            accesos={accesos}
            usuarios={usuarios}
            onRefresh={load}
            notify={notify}
          />
        ) : tab === "empresas" ? (
          <CompanyTable
            empresas={empresas}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        ) : (
          <AccesosPanel accesos={accesos} onRefresh={load} notify={notify} />
        )}
      </div>
    </>
  );
}
