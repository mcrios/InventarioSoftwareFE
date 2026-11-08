import { http } from "@/lib/httpClient";
import type {
  ApiResponse,
  Equipo,
  EquipoInput,
  EquipoSoftware,
  EquipoSoftwareInput,
  Page,
  PageableParams,
} from "@/types/api";

function unwrap<T>(response: ApiResponse<T>): T {
  if (!response.success) {
    throw new Error(response.message || "No se pudo completar la operación.");
  }

  return response.data;
}

export const equipmentService = {
  listEquipos: async (
    params: PageableParams = {},
  ): Promise<Page<Equipo>> => {
    const { page = 0, size = 100, sort } = params;

    return unwrap(
      await http.get<Page<Equipo>>("/equipos/", {
        params: {
          page,
          size,
          ...(sort?.length ? { sort: sort.join(",") } : {}),
        },
      }),
    );
  },

  getEquipo: async (id: number): Promise<Equipo> =>
    unwrap(await http.get<Equipo>(`/equipos/${id}`)),

  createEquipo: async (payload: EquipoInput): Promise<Equipo> =>
    unwrap(await http.post<Equipo>("/equipos/", payload)),

  updateEquipo: async (id: number, payload: EquipoInput): Promise<Equipo> =>
    unwrap(await http.put<Equipo>(`/equipos/${id}`, payload)),

  deleteEquipo: async (id: number): Promise<void> => {
    unwrap(await http.delete<Equipo>(`/equipos/${id}`));
  },

  listEquipoSoftware: async (
    params: PageableParams = {},
  ): Promise<Page<EquipoSoftware>> => {
    const { page = 0, size = 200, sort } = params;

    return unwrap(
      await http.get<Page<EquipoSoftware>>("/equipo-software/", {
        params: {
          page,
          size,
          ...(sort?.length ? { sort: sort.join(",") } : {}),
        },
      }),
    );
  },

  createEquipoSoftware: async (
    payload: EquipoSoftwareInput,
  ): Promise<EquipoSoftware> =>
    unwrap(await http.post<EquipoSoftware>("/equipo-software/", payload)),

  updateEquipoSoftware: async (
    id: number,
    payload: EquipoSoftwareInput,
  ): Promise<EquipoSoftware> =>
    unwrap(await http.put<EquipoSoftware>(`/equipo-software/${id}`, payload)),

  deleteEquipoSoftware: async (id: number): Promise<void> => {
    unwrap(await http.delete<EquipoSoftware>(`/equipo-software/${id}`));
  },
};
