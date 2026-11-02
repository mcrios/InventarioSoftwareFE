# InventarioSoftwareFE

Sistema para llevar control de software dentro de una empresa. Proyecto front end.

## Tecnologías

- [Next.js](https://nextjs.org) 16 (App Router)
- TypeScript
- Tailwind CSS 4
- ESLint

## Requisitos

- Node.js LTS 

## Desarrollo

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). La raíz redirige al login.

Para entrar al panel usa cualquier correo válido y una contraseña de 6 o más
caracteres (el flujo de autenticación es simulado).

## Scripts

- `npm run dev` — servidor de desarrollo
- `npm run build` — build de producción
- `npm start` — servidor de producción
- `npm run lint` — linter

## Estructura

```text
src/
  app/
    (auth)/          # Layout público: login, registro y recuperación
    (dashboard)/     # Layout privado con sidebar y header
    layout.tsx       # Layout raíz, fuentes y estilos globales
  components/
    auth/            # Formularios de autenticación
    dashboard/       # Componentes del inventario y paneles
    layout/          # Sidebar, header y shell de la aplicación
    ui/              # Botones, inputs, badges, cards e iconos
    users/           # Tabla de usuarios
  lib/               # Datos mock, navegación y utilidades
  types/             # Tipos compartidos
public/fonts/        # Fuente local de iconos Material Symbols
```

## Rutas

| Ruta | Descripción |
| --- | --- |
| `/login` | Inicio de sesión |
| `/register` | Registro de cuenta |
| `/forgot-password` | Recuperación de contraseña |
| `/dashboard` | Panel de control |
| `/inventory` | Inventario de activos |
| `/inventory/new` | Alta de un nuevo activo |
| `/software` | Software y parches |
| `/approvals` | Aprobaciones |
| `/licenses` | Gestión de licencias |
| `/alerts` | Alertas y CVEs |
| `/users` | Usuarios y roles |
| `/settings` | Configuración |
