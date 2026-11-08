import { http } from "@/lib/httpClient";
import type {
  Actualizacion,
  ActualizacionInput,
  ApiResponse,
  Page,
  PageableParams,
  Software,
  SoftwareInput,
  TipoSoftware,
} from "@/types/api";

function unwrap<T>(response: ApiResponse<T>): T {
  if (!response.success) {
    throw new Error(response.message || "No se pudo completar la operación.");
  }

  return response.data;
}

function buildParams(params: PageableParams) {
  const { page = 0, size = 100, sort } = params;

  return {
    page,
    size,
    ...(sort?.length ? { sort: sort.join(",") } : {}),
  };
}

export const softwareService = {
  listSoftware: async (
    params: PageableParams = {},
  ): Promise<Page<Software>> =>
    unwrap(
      await http.get<Page<Software>>("/software/", {
        params: buildParams(params),
      }),
    ),

  getSoftware: async (id: number): Promise<Software> =>
    unwrap(await http.get<Software>(`/software/${id}`)),

  createSoftware: async (payload: SoftwareInput): Promise<Software> =>
    unwrap(await http.post<Software>("/software/", payload)),

  updateSoftware: async (
    id: number,
    payload: SoftwareInput,
  ): Promise<Software> =>
    unwrap(await http.put<Software>(`/software/${id}`, payload)),

  deleteSoftware: async (id: number): Promise<void> => {
    unwrap(await http.delete<Software>(`/software/${id}`));
  },

  listTiposSoftware: async (): Promise<TipoSoftware[]> =>
    unwrap(await http.get<TipoSoftware[]>("/tipos-software/")),
};

export const updateService = {
  listActualizaciones: async (
    params: PageableParams = {},
  ): Promise<Page<Actualizacion>> =>
    unwrap(
      await http.get<Page<Actualizacion>>("/actualizaciones/", {
        params: buildParams(params),
      }),
    ),

  createActualizacion: async (
    payload: ActualizacionInput,
  ): Promise<Actualizacion> =>
    unwrap(await http.post<Actualizacion>("/actualizaciones/", payload)),

  deleteActualizacion: async (id: number): Promise<void> => {
    unwrap(await http.delete<Actualizacion>(`/actualizaciones/${id}`));
  },
};
