"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { NotificationList } from "@/components/notifications/NotificationList";
import { NotificationStats } from "@/components/notifications/NotificationStats";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Icon } from "@/components/ui/Icon";
import { notificationService } from "@/lib/notificationService";
import { cn, getErrorMessage } from "@/lib/utils";
import type { Notificacion, Usuario } from "@/types/api";
import { resolveCurrentUser } from "@/lib/session";

export function NotificationWorkspace() {
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
  const [currentUser, setCurrentUser] = useState<Usuario|null>(null);

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
      const page = await notificationService.listNotificaciones({
        page: 0,
        size: 100,
        sort: ["id,desc"],
      });
      setNotificaciones(page.content.filter((notificacion) => notificacion.usuario.email === currentUser?.email));
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
          .then((usuario) => {
            if (!cancelled) setCurrentUser(usuario);
            console.log(usuario);
          })
          .finally(() => {
            if (!cancelled) setLoading(false);
          });

    notificationService
      .listNotificaciones({ page: 0, size: 100, sort: ["id,desc"] })
      .then((page) => {
        console.log(currentUser);
        
        if (cancelled) return;
        setNotificaciones(page.content.filter((notificacion) => notificacion.usuario.email === currentUser?.email));
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
    const unread = notificaciones.filter((notificacion) => !notificacion.leida);

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

  const noLeidas = notificaciones.filter(
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
                  loading && "animate-pulse",
                )}
              />
              <span className="font-label-mono-xs text-label-mono-xs text-secondary">
                {loading ? "Sincronizando..." : "Bandeja sincronizada"}
              </span>
            </div>

            <Button
              variant="secondary"
              onClick={() => void handleMarkAllRead()}
              disabled={loading || markingAll || noLeidas === 0}
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
              disabled={loading}
            >
              <Icon
                name={loading ? "progress_activity" : "refresh"}
                className={cn("text-[17px]", loading && "animate-spin")}
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

      {error ? (
        <Card className="mb-4 flex flex-col gap-3 border border-error-container p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2 text-on-error-container">
            <Icon name="error" className="mt-0.5 text-[18px]" filled />
            <div className="flex flex-col">
              <span className="font-title-md text-body-sm">
                No se pudieron cargar las notificaciones
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
            Cargando notificaciones...
          </span>
        </Card>
      ) : (
        <>
          <NotificationStats notificaciones={notificaciones} />
          <NotificationList
            notificaciones={notificaciones}
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
