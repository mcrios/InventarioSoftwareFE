import { http } from "@/lib/httpClient";
import type {
  ApiResponse,
  Empresa,
  EmpresaInput,
  Page,
  PageableParams,
} from "@/types/api";

function unwrap<T>(response: ApiResponse<T>): T {
  if (!response.success) {
    throw new Error(response.message || "No se pudo completar la operación.");
  }

  return response.data;
}

export const companyService = {
  listEmpresas: async (
    params: PageableParams = {},
  ): Promise<Page<Empresa>> => {
    const { page = 0, size = 100, sort } = params;

    return unwrap(
      await http.get<Page<Empresa>>("/empresas/", {
        params: {
          page,
          size,
          ...(sort?.length ? { sort: sort.join(",") } : {}),
        },
      }),
    );
  },

  createEmpresa: async (payload: EmpresaInput): Promise<Empresa> =>
    unwrap(await http.post<Empresa>("/empresas/", payload)),

  updateEmpresa: async (
    id: number,
    payload: EmpresaInput,
  ): Promise<Empresa> =>
    unwrap(await http.put<Empresa>(`/empresas/${id}`, payload)),

  deleteEmpresa: async (id: number): Promise<void> => {
    unwrap(await http.delete<Empresa>(`/empresas/${id}`));
  },
};
