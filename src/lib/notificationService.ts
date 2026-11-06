import { http } from "@/lib/httpClient";
import { formatDateTime } from "@/lib/format";
import type {
  ApiResponse,
  Notificacion,
  Page,
  PageableParams,
  SolicitudActualizacion,
} from "@/types/api";

function unwrap<T>(response: ApiResponse<T>): T {
  if (!response.success) {
    throw new Error(response.message || "No se pudo completar la operación.");
  }

  return response.data;
}

export interface ApprovalNotificationPlan {
  tipo: "ACTUALIZACION_APROBADA";
  titulo: string;
  mensaje: string;
  empresaId: number;
  softwareId: number;
  solicitudId: number;
  /** Define el alcance que deberá resolver el endpoint de envío. */
  alcance: "usuarios-empresa-con-software-en-uso";
}

/**
 * Construye el contenido y el alcance de la notificación que se enviará
 * cuando una empresa apruebe una solicitud de actualización.
 */
export function buildApprovalNotificationPlan(
  solicitud: SolicitudActualizacion,
): ApprovalNotificationPlan {
  const software = solicitud.actualizacion.software;
  const versionOrigen =
    solicitud.actualizacion.versionOrigen || software.versionActual;
  const versionDestino = solicitud.actualizacion.versionDestino;

  return {
    tipo: "ACTUALIZACION_APROBADA",
    titulo: `Actualización aprobada: ${software.nombre} ${versionDestino}`,
    mensaje: `${solicitud.empresa.nombre} aprobó la actualización de ${software.nombre} de la versión ${versionOrigen} a ${versionDestino}. Ventana de despliegue: ${formatDateTime(solicitud.fechaInicioRango)} - ${formatDateTime(solicitud.fechaFinRango)}.`,
    empresaId: solicitud.empresa.id,
    softwareId: software.id,
    solicitudId: solicitud.id,
    alcance: "usuarios-empresa-con-software-en-uso",
  };
}

/**
 * TODO: reemplazar por la llamada al endpoint de notificaciones masivas
 * cuando exista en el servicio. Debe resolver los usuarios de la empresa
 * que tienen el software en uso y crear una Notificacion por usuario.
 */
export async function sendApprovalNotification(
  plan: ApprovalNotificationPlan,
): Promise<{ sent: boolean; pendingEndpoint: boolean }> {
  void plan;

  return { sent: false, pendingEndpoint: true };
}

export const notificationService = {
  listNotificaciones: async (
    params: PageableParams = {},
  ): Promise<Page<Notificacion>> => {
    const { page = 0, size = 100, sort } = params;

    return unwrap(
      await http.get<Page<Notificacion>>("/notificaciones/", {
        params: {
          page,
          size,
          ...(sort?.length ? { sort: sort.join(",") } : {}),
        },
      }),
    );
  },

  updateNotificacion: async (
    notificacion: Notificacion,
  ): Promise<Notificacion> =>
    unwrap(
      await http.put<Notificacion>(
        `/notificaciones/${notificacion.id}`,
        notificacion,
      ),
    ),

  markAsRead: async (notificacion: Notificacion): Promise<Notificacion> =>
    unwrap(
      await http.put<Notificacion>(`/notificaciones/${notificacion.id}`, {
        ...notificacion,
        leida: true,
      }),
    ),

  deleteNotificacion: async (id: number): Promise<void> => {
    unwrap(await http.delete<Notificacion>(`/notificaciones/${id}`));
  },
};
