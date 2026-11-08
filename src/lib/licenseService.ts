import { http } from "@/lib/httpClient";
import type {
  ApiResponse,
  Licencia,
  LicenciaInput,
  LicenciaRenovacionInput,
  Page,
  PageableParams,
} from "@/types/api";

function unwrap<T>(response: ApiResponse<T>): T {
  if (!response.success) {
    throw new Error(response.message || "No se pudo completar la operación.");
  }

  return response.data;
}

export const licenseService = {
  listLicencias: async (
    params: PageableParams = {},
  ): Promise<Page<Licencia>> => {
    const { page = 0, size = 100, sort } = params;

    return unwrap(
      await http.get<Page<Licencia>>("/licencias/", {
        params: {
          page,
          size,
          ...(sort?.length ? { sort: sort.join(",") } : {}),
        },
      }),
    );
  },

  getLicencia: async (id: number): Promise<Licencia> =>
    unwrap(await http.get<Licencia>(`/licencias/${id}`)),

  createLicencia: async (payload: LicenciaInput): Promise<Licencia> =>
    unwrap(await http.post<Licencia>("/licencias/", payload)),

  updateLicencia: async (
    id: number,
    payload: LicenciaInput,
  ): Promise<Licencia> =>
    unwrap(await http.put<Licencia>(`/licencias/${id}`, payload)),

  renovarLicencia: async (
    id: number,
    current: Licencia,
    renewal: LicenciaRenovacionInput,
  ): Promise<Licencia> => {
    const payload: LicenciaInput = {
      empresa: { id: current.empresa.id },
      codigoClave:
        renewal.codigoClave !== undefined && renewal.codigoClave !== null
          ? renewal.codigoClave
          : current.codigoClave,
      archivoUrl: current.archivoUrl,
      cantidadTotal:
        renewal.cantidadTotal !== undefined && renewal.cantidadTotal > 0
          ? renewal.cantidadTotal
          : current.cantidadTotal,
      cantidadUsada: current.cantidadUsada,
      fechaVencimiento: renewal.fechaVencimiento,
    };

    return unwrap(await http.put<Licencia>(`/licencias/${id}`, payload));
  },

  deleteLicencia: async (id: number): Promise<void> => {
    unwrap(await http.delete<Licencia>(`/licencias/${id}`));
  },
};

