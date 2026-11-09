export interface JwtPayload {
  sub?: string;
  email?: string;
  exp?: number;
  [key: string]: unknown;
}

/** Claims que el backend incluye en el token de acceso. */
export interface SessionJwtPayload extends JwtPayload {
  type?: string;
  nombre?: string;
  roles?: string[];
  accesos?: Record<
    string,
    { path?: string | null; descripcion?: string | null }
  >;
  empresas?: string[];
}

/**
 * Decodifica el payload de un JWT sin validar la firma.
 *
 * Se usa solo para leer datos de navegación (correo, expiración y accesos).
 * La autorización real de los datos siempre la hace el backend al validar el
 * token en cada petición.
 */
export function decodeJwtPayload<T extends JwtPayload = JwtPayload>(
  token: string,
): T | null {
  try {
    const part = token.split(".")[1];

    if (!part) return null;

    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const padding = "=".repeat((4 - (base64.length % 4)) % 4);
    const binary = atob(base64 + padding);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);

    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}
