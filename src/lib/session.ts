import { decodeJwtPayload, type JwtPayload } from "@/lib/jwt";
import { securityService } from "@/lib/securityService";
import type { Usuario } from "@/types/api";

const CURRENT_USER_ID_KEY = "currentUserId";
const CURRENT_USER_KEY = "currentUser";
const CURRENT_USER_EVENT = "current-user:changed";

/** Petición en curso para evitar consultas duplicadas entre pantallas. */
let pendingCurrentUser: Promise<Usuario | null> | null = null;

function getToken() {
  if (typeof document === "undefined") return null;

  const match = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);

  if (match?.[1]) return decodeURIComponent(match[1]);

  return window.localStorage.getItem("token");
}

function decodePayload(token: string): JwtPayload | null {
  return decodeJwtPayload<JwtPayload>(token);
}

/** Correo del usuario autenticado, leído desde el subject del JWT. */
export function getSessionEmail(): string | null {
  if (typeof window === "undefined") return null;

  const token = getToken();

  if (!token) return null;

  const payload = decodePayload(token);

  return payload?.sub ?? payload?.email ?? null;
}

function isUsuario(value: unknown): value is Usuario {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<Usuario>;

  return (
    typeof candidate.id === "number" &&
    typeof candidate.email === "string" &&
    typeof candidate.nombre === "string" &&
    Array.isArray(candidate.roles) &&
    Array.isArray(candidate.empresas)
  );
}

function readStoredCurrentUser(): Usuario | null {
  if (typeof window === "undefined") return null;

  // Sin token no hay sesión activa: se descarta cualquier usuario recordado.
  if (!getToken()) {
    window.localStorage.removeItem(CURRENT_USER_KEY);
    window.localStorage.removeItem(CURRENT_USER_ID_KEY);
    return null;
  }

  const raw = window.localStorage.getItem(CURRENT_USER_KEY);

  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);

    if (isUsuario(parsed)) return parsed;
  } catch {
    // El contenido almacenado no es válido; se descarta abajo.
  }

  window.localStorage.removeItem(CURRENT_USER_KEY);

  return null;
}

/**
 * Lectura síncrona del usuario cacheado. No consulta la API y no modifica la
 * caché más allá de descartar contenido inválido o de una sesión cerrada.
 */
export function getCurrentUserSnapshot(): Usuario | null {
  return readStoredCurrentUser();
}

/**
 * Notifica cuando el usuario de la sesión se guarda, actualiza o elimina.
 * Se combina con el evento `storage` para mantener sincronizadas las pestañas.
 */
export function subscribeToCurrentUser(listener: () => void) {
  if (typeof window === "undefined") return () => {};

  function handleStorage(event: StorageEvent) {
    if (
      !event.key ||
      event.key === CURRENT_USER_KEY ||
      event.key === CURRENT_USER_ID_KEY
    ) {
      listener();
    }
  }

  window.addEventListener(CURRENT_USER_EVENT, listener);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(CURRENT_USER_EVENT, listener);
    window.removeEventListener("storage", handleStorage);
  };
}

function notifyCurrentUserChange() {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new Event(CURRENT_USER_EVENT));
}

function rememberCurrentUserId(id: number) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(CURRENT_USER_ID_KEY, String(id));
}

function getRememberedUserId(): number | null {
  if (typeof window === "undefined") return null;

  const value = window.localStorage.getItem(CURRENT_USER_ID_KEY);

  if (!value) return null;

  const id = Number(value);

  return Number.isFinite(id) ? id : null;
}

/**
 * Guarda el usuario completo en el almacenamiento local para que todas las
 * pantallas lo reutilicen sin volver a consultar la API.
 */
export function rememberCurrentUser(usuario: Usuario) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(usuario));
  rememberCurrentUserId(usuario.id);
  notifyCurrentUserChange();
}

/** Limpia el usuario cacheado y el id recordado al cerrar sesión. */
export function forgetCurrentUser() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(CURRENT_USER_KEY);
  window.localStorage.removeItem(CURRENT_USER_ID_KEY);
  notifyCurrentUserChange();
}

async function fetchCurrentUserFromApi(): Promise<Usuario | null> {
  const email = getSessionEmail();

  if (email) {
    try {
      const page = await securityService.listUsuarios({ page: 0, size: 100 });
      const usuario = page.content.find(
        (item) => item.email.toLowerCase() === email.toLowerCase(),
      );

      if (usuario) return usuario;
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

interface ResolveCurrentUserOptions {
  /** Fuerza una consulta a la API e ignora el usuario cacheado. */
  force?: boolean;
}

/**
 * Resuelve la entidad Usuario de la sesión.
 *
 * Primero usa el usuario guardado al iniciar sesión (o al actualizar el
 * perfil). Solo consulta la API cuando no existe caché o cuando se fuerza
 * una actualización.
 */
export async function resolveCurrentUser(
  options: ResolveCurrentUserOptions = {},
): Promise<Usuario | null> {
  if (typeof window === "undefined") return null;

  if (!options.force) {
    const cached = readStoredCurrentUser();

    if (cached) return cached;
  }

  // Varias pantallas pueden resolver el usuario a la vez; comparten la misma
  // petición para no duplicar la consulta a /usuarios/.
  if (!pendingCurrentUser) {
    pendingCurrentUser = fetchCurrentUserFromApi()
      .then((usuario) => {
        if (usuario) {
          rememberCurrentUser(usuario);
        }

        return usuario;
      })
      .finally(() => {
        pendingCurrentUser = null;
      });
  }

  return pendingCurrentUser;
}
