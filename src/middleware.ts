import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 1. Define las rutas que son públicas (exactas o prefijos)
const publicRoutes = [
  '/login',
  '/registro',
  '/forgot-password',
  // Agrega aquí cualquier otra ruta pública, ej: '/contacto', '/sobre-nosotros'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 2. Verificamos si la ruta actual está en la lista de rutas públicas
  const isPublicRoute = publicRoutes.some((route) => 
    pathname === route || pathname.startsWith(route + '/')
  );

  // Buscamos el token JWT en las cookies
  const token = request.cookies.get('token')?.value;

  // CASO A: Es una ruta protegida y NO tiene token -> Redirigir al login
  if (!isPublicRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    // Opcional: Guardamos la URL a la que intentaba entrar para redirigirlo después de loguearse
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // CASO B: Ya tiene sesión y trata de ir al login o registro -> Redirigir al dashboard (o home)
  const isAuthRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route + '/'));
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Si pasa las validaciones, la petición continúa su curso normal
  return NextResponse.next();
}

// 3. Configura el matcher para que el middleware no se ejecute en archivos estáticos o imágenes
export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas excepto las que empiezan por:
     * - api (rutas de api de next si deseas excluirlas)
     * - _next/static (archivos estáticos)
     * - _next/image (archivos optimizados de imágenes)
     * - favicon.ico (icono)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2|woff|ttf|eot|ico)).*)',
  ],
};