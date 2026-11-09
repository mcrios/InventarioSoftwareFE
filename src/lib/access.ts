import { navigation, type NavSection } from "@/lib/navigation";
import type { SessionJwtPayload } from "@/lib/jwt";
import type { Usuario } from "@/types/api";

/** Rutas visibles sin haber iniciado sesión. */
export const PUBLIC_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/403",
  "/404",
] as const;

/** Rutas disponibles para cualquier usuario con sesión, sin acceso explícito. */
export const BASE_ROUTES = [
  "/dashboard",
  "/notifications",
  "/settings",
] as const;

/** Ruta a la que se envía al usuario después de iniciar sesión. */
export const LANDING_ROUTE = "/dashboard";

const BASE_ROUTE_SET = new Set<string>(BASE_ROUTES);

interface AccessItem {
  path?: string | null;
}

/**
 * Rutas del menú que exigen un acceso cuyo `path` coincida. Se derivan de la
 * navegación para que sidebar y proxy compartan exactamente las mismas reglas.
 */
export const PROTECTED_ROUTES: string[] = Array.from(
  new Set([
    ...navigation.flatMap((section) => section.items.map((item) => item.href)),
    "/alerts",
  ]),
).filter((route) => !BASE_ROUTE_SET.has(route));

/** Normaliza una ruta para compararla sin barras finales ni query string. */
export function normalizePath(pathname: string): string {
  const clean = (pathname.split("?")[0] ?? "").split("#")[0]?.trim() ?? "";

  if (!clean) return "/";

  const withSlash = clean.startsWith("/") ? clean : `/${clean}`;
  const withoutTrailing = withSlash.replace(/\/+$/, "");

  return withoutTrailing || "/";
}

function matchesRoute(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

export function isPublicRoute(pathname: string): boolean {
  const path = normalizePath(pathname);

  return PUBLIC_ROUTES.some((route) => matchesRoute(path, route));
}

export function isBaseRoute(pathname: string): boolean {
  const path = normalizePath(pathname);

  return BASE_ROUTES.some((route) => matchesRoute(path, route));
}

/** Devuelve la ruta protegida que corresponde al pathname, si existe. */
export function getProtectedRoute(pathname: string): string | null {
  const path = normalizePath(pathname);
  let match: string | null = null;

  for (const route of PROTECTED_ROUTES) {
    if (!matchesRoute(path, route)) continue;
    if (!match || route.length > match.length) {
      match = route;
    }
  }

  return match;
}

/** Extrae las rutas de acceso de una lista de accesos. */
export function collectAccessPaths(
  items: Array<AccessItem | null | undefined>,
): string[] {
  const paths = new Set<string>();

  for (const item of items) {
    const path = item?.path?.trim();

    if (path) {
      paths.add(normalizePath(path));
    }
  }

  return Array.from(paths);
}

/** Rutas de acceso del usuario cacheado en sesión. */
export function getAccessPathsFromUsuario(
  usuario: Usuario | null | undefined,
): string[] {
  const accesos =
    usuario?.roles?.flatMap((role) => role.accesos ?? []) ?? [];

  return collectAccessPaths(accesos);
}

/** Rutas de acceso incluidas en los claims del JWT. */
export function getAccessPathsFromClaims(
  payload: SessionJwtPayload | null | undefined,
): string[] {
  const accesos = payload?.accesos;

  if (!accesos) return [];

  const items = Array.isArray(accesos)
    ? accesos
    : Object.values(accesos);

  return collectAccessPaths(items as AccessItem[]);
}

/**
 * Indica si el usuario puede navegar al pathname indicado.
 *
 * - Las rutas base y las desconocidas se permiten (las desconocidas terminan
 *   en el 404 de Next).
 * - Las rutas de módulo requieren un acceso cuya ruta cubra el pathname.
 */
export function canAccessPath(
  accessPaths: string[],
  pathname: string,
): boolean {
  if (isBaseRoute(pathname)) return true;

  const required = getProtectedRoute(pathname);

  if (!required) return true;

  const path = normalizePath(pathname);

  return accessPaths.some((access) => matchesRoute(path, access));
}

/** Navegación visible para el conjunto de accesos del usuario. */
export function getVisibleNavigation(accessPaths: string[]): NavSection[] {
  return navigation
    .map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        canAccessPath(accessPaths, item.href),
      ),
    }))
    .filter((section) => section.items.length > 0);
}
