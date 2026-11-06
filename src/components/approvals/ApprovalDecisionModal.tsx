"use client";

import { useState, type ReactNode } from "react";
import { getApprovalStatusMeta } from "@/components/approvals/approvalStatus";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import {
  APPROVAL_STATE,
  isPendingApproval,
  type ApprovalDecision,
} from "@/lib/approvalService";
import { formatDateTime } from "@/lib/format";
import { cn, getErrorMessage } from "@/lib/utils";
import type { SolicitudActualizacion } from "@/types/api";

interface ApprovalDecisionModalProps {
  solicitud: SolicitudActualizacion;
  onClose: () => void;
  onDecide: (
    solicitud: SolicitudActualizacion,
    decision: ApprovalDecision,
    observaciones: string,
  ) => Promise<void>;
}

interface DetailItemProps {
  label: string;
  children: ReactNode;
  className?: string;
}

function DetailItem({ label, children, className }: DetailItemProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-xl bg-surface-container-low px-3 py-2.5",
        className,
      )}
    >
      <span className="font-label-mono-xs text-label-mono-xs uppercase tracking-wider text-secondary">
        {label}
      </span>
      <div className="font-body-sm text-body-sm text-on-surface">{children}</div>
    </div>
  );
}

export function ApprovalDecisionModal({
  solicitud,
  onClose,
  onDecide,
}: ApprovalDecisionModalProps) {
  const [observaciones, setObservaciones] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<ApprovalDecision | null>(null);

  const status = getApprovalStatusMeta(solicitud.estado);
  const pending = isPendingApproval(solicitud);
  const software = solicitud.actualizacion.software;
  const versionOrigen =
    solicitud.actualizacion.versionOrigen || software.versionActual;

  async function handleDecision(decision: ApprovalDecision) {
    if (decision === APPROVAL_STATE.rejected && !observaciones.trim()) {
      setError("Indica el motivo del rechazo antes de continuar.");
      return;
    }

    setSubmitting(decision);
    setError(null);

    try {
      await onDecide(solicitud, decision, observaciones);
    } catch (decisionError) {
      setError(getErrorMessage(decisionError));
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title="Revisar solicitud de actualización"
      description={`${solicitud.empresa.nombre} · ${software.nombre} ${solicitud.actualizacion.versionDestino}`}
      footer={
        pending ? (
          <>
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={Boolean(submitting)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={() => void handleDecision(APPROVAL_STATE.rejected)}
              disabled={Boolean(submitting)}
            >
              <Icon
                name={
                  submitting === APPROVAL_STATE.rejected
                    ? "progress_activity"
                    : "block"
                }
                className={cn(
                  "text-[17px]",
                  submitting === APPROVAL_STATE.rejected && "animate-spin",
                )}
              />
              <span>
                {submitting === APPROVAL_STATE.rejected
                  ? "Rechazando..."
                  : "Rechazar"}
              </span>
            </Button>
            <Button
              onClick={() => void handleDecision(APPROVAL_STATE.approved)}
              disabled={Boolean(submitting)}
            >
              <Icon
                name={
                  submitting === APPROVAL_STATE.approved
                    ? "progress_activity"
                    : "verified"
                }
                className={cn(
                  "text-[17px]",
                  submitting === APPROVAL_STATE.approved && "animate-spin",
                )}
              />
              <span>
                {submitting === APPROVAL_STATE.approved
                  ? "Aprobando..."
                  : "Aprobar"}
              </span>
            </Button>
          </>
        ) : (
          <Button variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
        )
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Badge tone={status.tone}>
            <Icon name={status.icon} className="text-[13px]" />
            {status.label}
          </Badge>
          <span className="font-label-mono-xs text-label-mono-xs text-secondary">
            Solicitud #{solicitud.id} · Creada el{" "}
            {formatDateTime(solicitud.fechaCreacion)}
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <DetailItem label="Empresa">
            <span className="font-title-md">{solicitud.empresa.nombre}</span>
            <span className="ml-1 text-secondary">
              {solicitud.empresa.identificador
                ? `(${solicitud.empresa.identificador})`
                : ""}
            </span>
          </DetailItem>

          <DetailItem label="Solicitante">
            <span className="font-title-md">{solicitud.solicitante.nombre}</span>
            <span className="mt-0.5 block font-label-mono-xs text-label-mono-xs text-secondary">
              {solicitud.solicitante.email}
            </span>
          </DetailItem>

          <DetailItem label="Software">
            <span className="font-title-md">{software.nombre}</span>
            <span className="mt-0.5 block font-label-mono-xs text-label-mono-xs text-secondary">
              {software.fabricante || "Sin fabricante"} · Tipo de cambio:{" "}
              {solicitud.actualizacion.tipoCambio}
            </span>
          </DetailItem>

          <DetailItem label="Versiones">
            <div className="flex items-center gap-2 font-code-md">
              <span className="text-secondary">{versionOrigen}</span>
              <Icon
                name="arrow_forward"
                className="text-[15px] text-secondary"
              />
              <span className="font-semibold text-primary-container">
                {solicitud.actualizacion.versionDestino}
              </span>
            </div>
          </DetailItem>

          <DetailItem label="Inicio de ventana">
            {formatDateTime(solicitud.fechaInicioRango)}
          </DetailItem>

          <DetailItem label="Fin de ventana">
            {formatDateTime(solicitud.fechaFinRango)}
          </DetailItem>
        </div>

        <DetailItem label="Formato de despliegue">
          {solicitud.formatoDespliegue}
        </DetailItem>

        {solicitud.actualizacion.descripcion ? (
          <DetailItem label="Descripción del cambio">
            {solicitud.actualizacion.descripcion}
          </DetailItem>
        ) : null}

        {solicitud.observaciones ? (
          <DetailItem label="Observaciones registradas">
            {solicitud.observaciones}
          </DetailItem>
        ) : null}

        {solicitud.aprobador ? (
          <div className="flex items-center gap-2 rounded-xl bg-surface-container-low px-3 py-2.5 font-body-sm text-body-sm text-secondary">
            <Icon name="verified_user" className="text-[18px]" />
            <span>
              Decisión registrada por{" "}
              <strong className="text-on-surface">
                {solicitud.aprobador.nombre}
              </strong>
              .
            </span>
          </div>
        ) : null}

        {pending ? (
          <div className="flex flex-col gap-3 border-t border-surface-variant pt-4">
            <div className="flex items-start gap-2 rounded-xl bg-surface-container-low px-3 py-2.5 font-body-sm text-body-sm text-secondary">
              <Icon name="info" className="mt-0.5 text-[18px]" />
              <span>
                Al aprobar, se preparará la notificación para los usuarios de
                la empresa que tienen este software en uso. El envío se
                habilitará cuando el endpoint esté disponible.
              </span>
            </div>

            {error ? (
              <div className="flex items-start gap-2 rounded-xl bg-error-container px-3 py-2.5 font-body-sm text-body-sm text-on-error-container">
                <Icon name="error" className="mt-0.5 text-[18px]" filled />
                <span>{error}</span>
              </div>
            ) : null}

            <label className="flex flex-col gap-1.5">
              <span className="font-label-mono-xs text-label-mono-xs uppercase tracking-wider text-secondary">
                Observaciones de la decisión (obligatorias para rechazar)
              </span>
              <textarea
                value={observaciones}
                onChange={(event) => setObservaciones(event.target.value)}
                rows={3}
                maxLength={500}
                placeholder="Describe el motivo de la decisión o cualquier condición para el despliegue..."
                className="w-full resize-y rounded-xl border border-surface-variant bg-surface-container-lowest px-3 py-2.5 font-body-md text-body-md text-on-surface placeholder:text-secondary focus:border-primary-container focus:outline-none focus:ring-2 focus:ring-primary-container/20"
              />
            </label>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
