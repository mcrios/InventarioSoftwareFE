import { securityService } from "@/lib/securityService";
import type { Usuario } from "@/types/api";

interface JwtPayload {
  sub?: string;
  email?: string;
}

const CURRENT_USER_ID_KEY = "currentUserId";

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

/** Recuerda el id del usuario para mantener la sesión si luego cambia el correo. */
export function rememberCurrentUserId(id: number) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(CURRENT_USER_ID_KEY, String(id));
}

export function forgetCurrentUserId() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(CURRENT_USER_ID_KEY);
}

function getRememberedUserId(): number | null {
  if (typeof window === "undefined") return null;

  const value = window.localStorage.getItem(CURRENT_USER_ID_KEY);

  if (!value) return null;

  const id = Number(value);

  return Number.isFinite(id) ? id : null;
}

/**
 * Resuelve la entidad Usuario del backend a partir del correo del JWT.
 * Si el correo cambió y el token todavía apunta al anterior, usa el id
 * recordado durante la sesión como respaldo.
 */
export async function resolveCurrentUser(): Promise<Usuario | null> {
  const email = getSessionEmail();

  if (email) {
    try {
      const page = await securityService.listUsuarios({ page: 0, size: 100 });
      const usuario = page.content.find(
        (item) => item.email.toLowerCase() === email.toLowerCase(),
      );

      if (usuario) {
        rememberCurrentUserId(usuario.id);
        return usuario;
      }
    } catch {
      // Continúa con el respaldo por id recordado.
    }
  }

  const rememberedId = getRememberedUserId();

  if (!rememberedId) return null;

  try {
    return await securityService.getUsuario(rememberedId);
  } catch {
    return null;
  }
}
