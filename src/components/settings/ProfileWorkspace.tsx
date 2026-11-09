"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { ProfileForm } from "@/components/settings/ProfileForm";
import { ProfileSummary } from "@/components/settings/ProfileSummary";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { rememberCurrentUser, resolveCurrentUser } from "@/lib/session";
import { cn, getErrorMessage } from "@/lib/utils";
import type { Usuario } from "@/types/api";

export function ProfileWorkspace() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const noticeTimer = useRef<number | null>(null);

  const notify = useCallback((message: string) => {
    setNotice(message);

    if (noticeTimer.current) {
      window.clearTimeout(noticeTimer.current);
    }

    noticeTimer.current = window.setTimeout(() => {
      setNotice(null);
    }, 5000);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const current = await resolveCurrentUser();

      if (!current) {
        setUsuario(null);
        setError(
          "No se pudo identificar al usuario de la sesión. Verifica tu inicio de sesión e intenta nuevamente.",
        );
        return;
      }

      setUsuario(current);
      setError(null);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    resolveCurrentUser()
      .then((current) => {
        if (cancelled) return;

        if (!current) {
          setError(
            "No se pudo identificar al usuario de la sesión. Verifica tu inicio de sesión e intenta nuevamente.",
          );
          return;
        }

        setUsuario(current);
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

  function handleUpdated(updated: Usuario) {
    const emailChanged =
      usuario !== null &&
      updated.email.toLowerCase() !== usuario.email.toLowerCase();

    rememberCurrentUser(updated);
    setUsuario(updated);

    notify(
      emailChanged
        ? "Perfil actualizado. Tu correo cambió; recuerda usarlo en tu próximo inicio de sesión."
        : "Perfil actualizado correctamente.",
    );
  }

  const role = usuario?.roles[0]?.nombre ?? "Cuenta";

  return (
    <>
      <PageHeader
        eyebrow="Cuenta // Perfil de Usuario"
        title="Mi Perfil"
        badge={role}
        description="Consulta tu información de cuenta y actualiza tu nombre, correo o contraseña desde un solo lugar."
        actions={
          <div className="flex items-center gap-2 rounded-full bg-surface-container-low px-3 py-1.5 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-primary-container" />
            <span className="font-label-mono-xs text-label-mono-xs text-secondary">
              Sesión verificada
            </span>
          </div>
        }
      />

      {notice ? (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-secondary-container px-4 py-2.5 font-body-sm text-body-sm text-on-secondary-container">
          <Icon name="check_circle" className="text-[18px]" filled />
          <span>{notice}</span>
        </div>
      ) : null}

      {error ? (
        <Card className="flex flex-col gap-3 border border-error-container p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2 text-on-error-container">
            <Icon name="error" className="mt-0.5 text-[18px]" filled />
            <div className="flex flex-col">
              <span className="font-title-md text-body-sm">
                No se pudo cargar el perfil
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
            Cargando información del perfil...
          </span>
        </Card>
      ) : usuario ? (
        <div className={cn("grid grid-cols-1 items-start gap-5 xl:grid-cols-12")}>
          <div className="xl:col-span-4">
            <ProfileSummary usuario={usuario} />
          </div>
          <div className="xl:col-span-8">
            <ProfileForm usuario={usuario} onUpdated={handleUpdated} />
          </div>
        </div>
      ) : null}
    </>
  );
}
