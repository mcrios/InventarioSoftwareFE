import { http } from "@/lib/httpClient";
import {
  forgetCurrentUser,
  resolveCurrentUser,
} from "@/lib/session";
import type { LoginRequest, LoginResponse } from "@/types/api";

export const authService = {
  login: async (credentials: LoginRequest) => {
    // Tipamos fuertemente la respuesta que esperamos del backend
    const response = await http.post<LoginResponse>("/auth/login", credentials);

    // Si es exitoso, guardamos el token en cookie (para el middleware) y
    // resolvemos una sola vez el usuario completo para dejarlo en sesión.
    if (response.success && response.data.token) {
      document.cookie = `token=${response.data.token}; path=/; max-age=86400; SameSite=Lax;`;

      forgetCurrentUser();

      try {
        await resolveCurrentUser({ force: true });
      } catch {
        // El inicio de sesión no debe fallar si el perfil no se puede cachear;
        // las pantallas podrán resolverlo después si hace falta.
      }
    }

    return response;
  },

  logout: () => {
    localStorage.removeItem("token");
    forgetCurrentUser();
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  },
};
