import type { BadgeTone } from "@/components/ui/Badge";
import { APPROVAL_STATE, normalizeApprovalState } from "@/lib/approvalService";

export interface ApprovalStatusMeta {
  label: string;
  tone: BadgeTone;
  icon: string;
}

export function getApprovalStatusMeta(
  estado: string | null | undefined,
): ApprovalStatusMeta {
  const normalized = normalizeApprovalState(estado);

  if (normalized === APPROVAL_STATE.approved) {
    return {
      label: "Aprobada",
      tone: "success",
      icon: "check_circle",
    };
  }

  if (normalized === APPROVAL_STATE.rejected) {
    return {
      label: "Rechazada",
      tone: "danger",
      icon: "cancel",
    };
  }

  return {
    label: "Pendiente",
    tone: "warning",
    icon: "pending_actions",
  };
}
