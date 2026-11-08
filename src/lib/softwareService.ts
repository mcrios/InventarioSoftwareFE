import { http } from "@/lib/httpClient";
import type {
  Actualizacion,
  ApiResponse,
  Page,
  PageableParams,
  Software,
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
};
