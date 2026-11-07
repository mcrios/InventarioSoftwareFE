import { http } from "@/lib/httpClient";
import type {
  Acceso,
  AccesoInput,
  ApiResponse,
  Page,
  PageableParams,
  Rol,
  RolInput,
  Usuario,
  UsuarioInput,
} from "@/types/api";

function unwrap<T>(response: ApiResponse<T>): T {
  if (!response.success) {
    throw new Error(response.message || "No se pudo completar la operación.");
  }

  return response.data;
}

export const securityService = {
  // Accesos
  listAccesos: async (): Promise<Acceso[]> =>
    unwrap(await http.get<Acceso[]>("/accesos/")),

  createAcceso: async (payload: AccesoInput): Promise<Acceso> =>
    unwrap(await http.post<Acceso>("/accesos/", payload)),

  updateAcceso: async (id: number, payload: AccesoInput): Promise<Acceso> =>
    unwrap(await http.put<Acceso>(`/accesos/${id}`, payload)),

  deleteAcceso: async (id: number): Promise<void> => {
    unwrap(await http.delete<Acceso>(`/accesos/${id}`));
  },

  // Roles
  listRoles: async (): Promise<Rol[]> =>
    unwrap(await http.get<Rol[]>("/roles/")),

  createRol: async (payload: RolInput): Promise<Rol> =>
    unwrap(await http.post<Rol>("/roles/", payload)),

  updateRol: async (id: number, payload: RolInput): Promise<Rol> =>
    unwrap(await http.put<Rol>(`/roles/${id}`, payload)),

  deleteRol: async (id: number): Promise<void> => {
    unwrap(await http.delete<Rol>(`/roles/${id}`));
  },

  // Usuarios
  listUsuarios: async (
    params: PageableParams = {},
  ): Promise<Page<Usuario>> => {
    const { page = 0, size = 100, sort } = params;

    return unwrap(
      await http.get<Page<Usuario>>("/usuarios/", {
        params: {
          page,
          size,
          ...(sort?.length ? { sort: sort.join(",") } : {}),
        },
      }),
    );
  },

  getUsuario: async (id: number): Promise<Usuario> =>
    unwrap(await http.get<Usuario>(`/usuarios/${id}`)),

  createUsuario: async (payload: UsuarioInput): Promise<Usuario> =>
    unwrap(await http.post<Usuario>("/usuarios/", payload)),

  updateUsuario: async (
    id: number,
    payload: UsuarioInput,
  ): Promise<Usuario> =>
    unwrap(await http.put<Usuario>(`/usuarios/${id}`, payload)),

  deleteUsuario: async (id: number): Promise<void> => {
    unwrap(await http.delete<Usuario>(`/usuarios/${id}`));
  },
};
