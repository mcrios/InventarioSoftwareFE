import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  canAccessPath,
  getAccessPathsFromClaims,
  isPublicRoute,
  LANDING_ROUTE,
} from "@/lib/access";
import { decodeJwtPayload, type SessionJwtPayload } from "@/lib/jwt";

/** Rutas de autenticación que no tienen sentido con una sesión activa. */
const AUTH_ENTRY_ROUTES = ["/login", "/register", "/forgot-password"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  const payload = token
    ? decodeJwtPayload<SessionJwtPayload>(token)
    : null;
  const expired =
    typeof payload?.exp === "number" && payload.exp * 1000 <= Date.now();

  const hasValidSession = Boolean(token && payload && !expired);

  const isAuthEntry = AUTH_ENTRY_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  // CASO A: Ya hay sesión y se intenta entrar al login/registro.
  if (hasValidSession && isAuthEntry) {
    return NextResponse.redirect(new URL(LANDING_ROUTE, request.url));
  }

  // CASO B: Rutas públicas (login, registro, 403 y 404).
  if (isPublicRoute(pathname)) {
    const response = NextResponse.next();

    if (token && !hasValidSession) {
      response.cookies.delete("token");
    }

    return response;
  }

  // CASO C: Ruta protegida sin sesión válida -> login con retorno.
  if (!hasValidSession) {
    const loginUrl = new URL("/login", request.url);

    if (pathname !== "/") {
      loginUrl.searchParams.set(
        "callbackUrl",
        `${pathname}${request.nextUrl.search}`,
      );
    }

    const response = NextResponse.redirect(loginUrl);

    if (token) {
      response.cookies.delete("token");
    }

    return response;
  }

  // La raíz siempre lleva al panel principal.
  if (pathname === "/") {
    return NextResponse.redirect(new URL(LANDING_ROUTE, request.url));
  }

  // CASO D: La ruta existe pero el usuario no tiene el acceso requerido.
  const accessPaths = getAccessPathsFromClaims(payload);

  if (!canAccessPath(accessPaths, pathname)) {
    const forbiddenUrl = new URL("/403", request.url);

    forbiddenUrl.searchParams.set("from", pathname);

    return NextResponse.redirect(forbiddenUrl);
  }

  return NextResponse.next();
}

// El proxy no se ejecuta en archivos estáticos ni en imágenes optimizadas.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2|woff|ttf|eot|ico)).*)",
  ],
};
