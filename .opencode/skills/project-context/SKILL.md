---
name: project-context
description: Mapeo de arquitectura, árbol de directorios, convención de componentes UI y stack técnico del proyecto.
---

## Stack Tecnológico Principal
- **Framework:** Next.js (App Router)
- **Lenguaje:** TypeScript (Strict mode)
- **Estilos:** Tailwind CSS
- **Componentes UI:** Shadcn/ui (Radix UI) + Lucide React (íconos)
- **Gestión de Estado / Fetching:** TanStack Query (React Query) / Server Actions
- **Validación:** Zod

## Estructura del Proyecto
- `src/app/`: Rutas, páginas, layouts y Server Actions del App Router.
- `src/components/ui/`: Componentes atómicos base y reutilizables (Botones, Inputs, Modales de Shadcn).
- `src/components/modules/`: Componentes complejos organizados por dominio/módulo (ej. `auth/`, `dashboard/`, `products/`).
- `src/lib/`: Utilidades globales, clientes de API y configuraciones base (`utils.ts`).
- `src/hooks/`: Custom Hooks reutilizables para Client Components.
- `src/types/`: Definiciones e interfaces globales de TypeScript.

## Convenciones de Componentes y UI
1. **Composición sobre duplicación:** Revisa siempre si existe un componente base en `src/components/ui/` antes de crear nuevos elementos interactivos.
2. **Uso de `cn()`:** Utiliza la utilidad `cn()` de `src/lib/utils.ts` para fusionar clases de Tailwind CSS en lugar de concatenar strings.
3. **Ubicación de componentes:**
   - Si un componente solo se usa en una página/módulo específico, colócalo en `src/components/modules/<modulo>/`.
   - Si es un componente UI genérico, debe residir en `src/components/ui/`.
4. **Diseño Adaptable:** Aplica patrones Responsive First de Tailwind CSS (`sm:`, `md:`, `lg:`).

## Reglas de Interacción con OpenCode
- No reexplores la estructura de carpetas básica a menos que sea necesario agregar una nueva subcarpeta.
- Asume la jerarquía de directorios descrita arriba al sugerir importaciones relativas o absolutas (usa alias `@/...`).