import { http } from "@/lib/httpClient";
import type {
  ApiResponse,
  Page,
  PageableParams,
  SolicitudActualizacion,
  Usuario,
} from "@/types/api";

export const APPROVAL_STATE = {
  pending: "PENDIENTE",
  approved: "APROBADA",
  rejected: "RECHAZADA",
} as const;

export type ApprovalDecision =
  (typeof APPROVAL_STATE)["approved"] | (typeof APPROVAL_STATE)["rejected"];

function unwrap<T>(response: ApiResponse<T>): T {
  if (!response.success) {
    throw new Error(response.message || "No se pudo completar la operación.");
  }

  return response.data;
}

export function normalizeApprovalState(estado: string | null | undefined) {
  return (estado ?? "").trim().toUpperCase();
}

export function isPendingApproval(solicitud: SolicitudActualizacion) {
  return normalizeApprovalState(solicitud.estado) === APPROVAL_STATE.pending;
}

export const approvalService = {
  listSolicitudes: async (
    params: PageableParams = {},
  ): Promise<Page<SolicitudActualizacion>> => {
    const { page = 0, size = 100, sort } = params;

    return unwrap(
      await http.get<Page<SolicitudActualizacion>>(
        "/solicitudes-actualizacion/",
        {
          params: {
            page,
            size,
            ...(sort?.length ? { sort: sort.join(",") } : {}),
          },
        },
      ),
    );
  },

  decideSolicitud: async (
    solicitud: SolicitudActualizacion,
    decision: ApprovalDecision,
    observaciones: string,
    aprobador: Usuario | null,
  ): Promise<SolicitudActualizacion> => {
    const nota = observaciones.trim();

    return unwrap(
      await http.put<SolicitudActualizacion>(
        `/solicitudes-actualizacion/${solicitud.id}`,
        {
          ...solicitud,
          estado: decision,
          observaciones: nota || solicitud.observaciones,
          aprobador: aprobador ?? solicitud.aprobador,
        },
      ),
    );
  },
};
