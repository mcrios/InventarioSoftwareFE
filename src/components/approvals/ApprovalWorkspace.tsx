"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ApprovalDecisionModal } from "@/components/approvals/ApprovalDecisionModal";
import { ApprovalStats } from "@/components/approvals/ApprovalStats";
import { ApprovalTable } from "@/components/approvals/ApprovalTable";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import {
  APPROVAL_STATE,
  approvalService,
  isPendingApproval,
  type ApprovalDecision,
} from "@/lib/approvalService";
import {
  buildApprovalNotificationPlan,
  sendApprovalNotification,
} from "@/lib/notificationService";
import { resolveCurrentUser } from "@/lib/session";
import { cn, getErrorMessage } from "@/lib/utils";
import type { SolicitudActualizacion, Usuario } from "@/types/api";

export function ApprovalWorkspace() {
  const [solicitudes, setSolicitudes] = useState<SolicitudActualizacion[]>([]);
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{
    message: string;
    tone: "success" | "error";
  } | null>(null);
  const [reviewing, setReviewing] = useState<SolicitudActualizacion | null>(
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

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const page = await approvalService.listSolicitudes({
        page: 0,
        size: 100,
        sort: ["id,desc"],
      });
      setSolicitudes(page.content);
      setError(null);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    approvalService
      .listSolicitudes({ page: 0, size: 100, sort: ["id,desc"] })
      .then((page) => {
        if (cancelled) return;
        setSolicitudes(page.content);
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

  useEffect(() => {
    let cancelled = false;

    resolveCurrentUser().then((usuario) => {
      if (!cancelled) {
        setCurrentUser(usuario);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleDecision(
    solicitud: SolicitudActualizacion,
    decision: ApprovalDecision,
    observaciones: string,
  ) {
    const updated = await approvalService.decideSolicitud(
      solicitud,
      decision,
      observaciones,
      currentUser,
    );

    setSolicitudes((current) =>
      current.map((item) => (item.id === updated.id ? updated : item)),
    );
    setReviewing(null);

    if (decision === APPROVAL_STATE.approved) {
      const plan = buildApprovalNotificationPlan(updated);

      try {
        const result = await sendApprovalNotification(plan);
        notify(
          result.pendingEndpoint
            ? "Solicitud aprobada. La notificación quedó preparada; el envío se habilitará cuando el endpoint esté disponible."
            : "Solicitud aprobada y notificación enviada a los usuarios.",
        );
      } catch {
        notify(
          "Solicitud aprobada, pero no se pudo preparar la notificación.",
          "error",
        );
      }
    } else {
      notify("Solicitud rechazada. Se registró la observación de la decisión.");
    }
  }

  const pendientes = solicitudes.filter(isPendingApproval).length;

  return (
    <>
      <PageHeader
        eyebrow="Operaciones // Workflow de Actualizaciones"
        title="Aprobación de Actualizaciones"
        badge={`${pendientes} pendientes`}
        description="Revisa las solicitudes que recibieron las empresas cuando se publicó una actualización de software. Solo puedes aprobar o rechazar cada solicitud."
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

      <div className="mb-4 flex items-start gap-2 rounded-xl bg-surface-container-low px-4 py-2.5 font-body-sm text-body-sm text-secondary">
        <Icon name="outbox" className="mt-0.5 text-[18px]" />
        <span>
          El envío masivo de notificaciones al aprobar una solicitud está
          preparado, pero se activará cuando exista el endpoint correspondiente
          en el servicio.
        </span>
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
                No se pudieron cargar las solicitudes
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
            Cargando solicitudes de actualización...
          </span>
        </Card>
      ) : (
        <>
          <ApprovalStats solicitudes={solicitudes} />
          <ApprovalTable
            solicitudes={solicitudes}
            onReview={setReviewing}
          />
        </>
      )}

      {reviewing ? (
        <ApprovalDecisionModal
          solicitud={reviewing}
          onClose={() => setReviewing(null)}
          onDecide={handleDecision}
        />
      ) : null}
    </>
  );
}
