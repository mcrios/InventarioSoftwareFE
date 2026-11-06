import { securityService } from "@/lib/securityService";
import type { Usuario } from "@/types/api";

interface JwtPayload {
  sub?: string;
  email?: string;
}

function getToken() {
  if (typeof document === "undefined") return null;

  const match = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);

  if (match?.[1]) return decodeURIComponent(match[1]);

  return window.localStorage.getItem("token");
}

function decodePayload(token: string): JwtPayload | null {
  try {
    const payload = token.split(".")[1];

    if (!payload) return null;

    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const binary = window.atob(base64);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);

    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

/** Correo del usuario autenticado, leído desde el subject del JWT. */
export function getSessionEmail(): string | null {
  if (typeof window === "undefined") return null;

  const token = getToken();

  if (!token) return null;

  const payload = decodePayload(token);

  return payload?.sub ?? payload?.email ?? null;
}

/**
 * Resuelve la entidad Usuario del backend a partir del correo del JWT.
 * Devuelve null si no hay sesión o si el usuario no puede consultarse.
 */
export async function resolveCurrentUser(): Promise<Usuario | null> {
  const email = getSessionEmail();

  if (!email) return null;

  try {
    const page = await securityService.listUsuarios({ page: 0, size: 100 });

    return (
      page.content.find(
        (usuario) => usuario.email.toLowerCase() === email.toLowerCase(),
      ) ?? null
    );
  } catch {
    return null;
  }
}
