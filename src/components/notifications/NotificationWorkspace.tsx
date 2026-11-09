"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NotificationList } from "@/components/notifications/NotificationList";
import { NotificationStats } from "@/components/notifications/NotificationStats";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Icon } from "@/components/ui/Icon";
import { useSessionUser } from "@/hooks/useSessionUser";
import { notificationService } from "@/lib/notificationService";
import { cn, getErrorMessage } from "@/lib/utils";
import type { Notificacion } from "@/types/api";

export function NotificationWorkspace() {
  const { usuario, email: sessionEmail, ready: sessionReady } = useSessionUser();

  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{
    message: string;
    tone: "success" | "error";
  } | null>(null);
  const [markingId, setMarkingId] = useState<number | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [deleting, setDeleting] = useState<Notificacion | null>(null);
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

  const fetchPage = useCallback(
    async () =>
      (
        await notificationService.listNotificaciones({
          page: 0,
          size: 100,
          sort: ["id,desc"],
        })
      ).content,
    [],
  );

  const load = useCallback(async () => {
    setLoading(true);

    try {
      // Se guardan todas y el filtro por usuario se deriva en el render para
      // no depender del orden en que se resuelva la sesión.
      setNotificaciones(await fetchPage());
      setError(null);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, [fetchPage]);

  useEffect(() => {
    let cancelled = false;

    // La carga inicial no activa `loading` porque ya inicia en true; así se
    // evita un setState síncrono dentro del efecto.
    fetchPage()
      .then((content) => {
        if (cancelled) return;

        setNotificaciones(content);
        setError(null);
      })
      .catch((loadError: unknown) => {
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
  }, [fetchPage]);

  const notificacionesVisibles = useMemo(() => {
    const targetEmail = (usuario?.email ?? sessionEmail)?.toLowerCase() ?? null;

    if (!usuario && !targetEmail) return [];

    return notificaciones.filter((notificacion) => {
      if (usuario && notificacion.usuario?.id === usuario.id) {
        return true;
      }

      return (
        targetEmail !== null &&
        notificacion.usuario?.email?.toLowerCase() === targetEmail
      );
    });
  }, [notificaciones, usuario, sessionEmail]);

  const sessionError =
    sessionReady && !usuario && !sessionEmail
      ? "No se pudo identificar al usuario de la sesión. Vuelve a iniciar sesión."
      : null;

  const displayError = error ?? sessionError;
  // El correo del JWT basta para filtrar; no se bloquea la vista esperando
  // el perfil completo si la consulta de usuarios tarda.
  const pageLoading = loading || (!sessionReady && !sessionEmail);

  async function handleMarkRead(notificacion: Notificacion) {
    setMarkingId(notificacion.id);

    try {
      const updated = await notificationService.markAsRead(notificacion);

      setNotificaciones((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      notify("Notificación marcada como leída.");
    } catch (markError) {
      notify(getErrorMessage(markError), "error");
    } finally {
      setMarkingId(null);
    }
  }

  async function handleMarkAllRead() {
    const unread = notificacionesVisibles.filter(
      (notificacion) => !notificacion.leida,
    );

    if (!unread.length) return;

    setMarkingAll(true);

    const results = await Promise.allSettled(
      unread.map((notificacion) => notificationService.markAsRead(notificacion)),
    );

    const updated = results.flatMap((result) =>
      result.status === "fulfilled" ? [result.value] : [],
    );
    const failed = results.length - updated.length;

    if (updated.length) {
      const map = new Map(updated.map((item) => [item.id, item]));

      setNotificaciones((current) =>
        current.map((item) => map.get(item.id) ?? item),
      );
    }

    setMarkingAll(false);

    if (failed) {
      notify(
        `${updated.length} notificaciones marcadas como leídas; ${failed} fallaron.`,
        "error",
      );
    } else {
      notify(`${updated.length} notificaciones marcadas como leídas.`);
    }
  }

  async function handleDelete() {
    if (!deleting) return;

    setDeletingBusy(true);

    try {
      await notificationService.deleteNotificacion(deleting.id);
      setNotificaciones((current) =>
        current.filter((item) => item.id !== deleting.id),
      );
      setDeleting(null);
      notify("Notificación eliminada correctamente.");
    } catch (deleteError) {
      setDeleting(null);
      notify(getErrorMessage(deleteError), "error");
    } finally {
      setDeletingBusy(false);
    }
  }

  const noLeidas = notificacionesVisibles.filter(
    (notificacion) => !notificacion.leida,
  ).length;

  return (
    <>
      <PageHeader
        eyebrow="Operaciones // Centro de Notificaciones"
        title="Notificaciones"
        badge={`${noLeidas} sin leer`}
        description="Consulta los avisos generados por el ciclo de vida del software. Al aprobar una actualización se notificará a los usuarios de la empresa que tienen ese software en uso."
        actions={
          <>
            <div className="flex items-center gap-2 rounded-full bg-surface-container-low px-3 py-1.5 shadow-sm">
              <span
                className={cn(
                  "h-2 w-2 rounded-full bg-primary-container",
                  pageLoading && "animate-pulse",
                )}
              />
              <span className="font-label-mono-xs text-label-mono-xs text-secondary">
                {pageLoading ? "Sincronizando..." : "Bandeja sincronizada"}
              </span>
            </div>

            <Button
              variant="secondary"
              onClick={() => void handleMarkAllRead()}
              disabled={pageLoading || markingAll || noLeidas === 0}
            >
              <Icon
                name={markingAll ? "progress_activity" : "done_all"}
                className={cn("text-[17px]", markingAll && "animate-spin")}
              />
              <span>
                {markingAll ? "Marcando..." : "Marcar todas como leídas"}
              </span>
            </Button>

            <Button
              variant="secondary"
              onClick={() => void load()}
              disabled={pageLoading}
            >
              <Icon
                name={pageLoading ? "progress_activity" : "refresh"}
                className={cn("text-[17px]", pageLoading && "animate-spin")}
              />
              <span>Actualizar</span>
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

      {displayError ? (
        <Card className="mb-4 flex flex-col gap-3 border border-error-container p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2 text-on-error-container">
            <Icon name="error" className="mt-0.5 text-[18px]" filled />
            <div className="flex flex-col">
              <span className="font-title-md text-body-sm">
                No se pudieron cargar las notificaciones
              </span>
              <span className="font-body-sm text-body-sm">{displayError}</span>
            </div>
          </div>
          {error ? (
            <Button variant="secondary" onClick={() => void load()}>
              <Icon name="refresh" className="text-[17px]" />
              <span>Reintentar</span>
            </Button>
          ) : null}
        </Card>
      ) : null}

      {pageLoading ? (
        <Card className="flex min-h-[280px] flex-col items-center justify-center gap-3 p-8">
          <Icon
            name="progress_activity"
            className="animate-spin text-[28px] text-primary-container"
          />
          <span className="font-body-sm text-body-sm text-secondary">
            Cargando notificaciones...
          </span>
        </Card>
      ) : (
        <>
          <NotificationStats notificaciones={notificacionesVisibles} />
          <NotificationList
            notificaciones={notificacionesVisibles}
            markingId={markingId}
            onMarkRead={(notificacion) => void handleMarkRead(notificacion)}
            onDelete={setDeleting}
          />
        </>
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Eliminar notificación"
        description={
          deleting
            ? `Se eliminará la notificación "${deleting.titulo}" del historial.`
            : ""
        }
        loading={deletingBusy}
        onCancel={() => setDeleting(null)}
        onConfirm={() => void handleDelete()}
      />
    </>
  );
}
