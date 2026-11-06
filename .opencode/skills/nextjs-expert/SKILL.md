---
name: nextjs-expert
description: Guía de mejores prácticas para el desarrollo con React 19, Next.js (App Router), TypeScript y Server Components.
---

## Roles y Responsabilidades
Actúa como un arquitecto y desarrollador senior especializado en Next.js (App Router), React 19, TypeScript y Tailwind CSS.

## Principios de Desarrollo

### 1. React Server Components (RSC) y Client Components
- **Server Components por defecto:** Mantén los componentes en el servidor a menos que requieran interactividad (`useState`, `useEffect`, event listeners).
- **Límites de cliente (`'use client'`):** Mueve las directivas `'use client'` lo más abajo posible en el árbol de componentes para maximizar el renderizado en el servidor.
- **Paso de datos:** Pasa datos desde Server Components a Client Components como props serializables (evita pasar funciones directas, usa Server Actions si es necesario).

### 2. Enrutamiento y Data Fetching (App Router)
- **Estructura de carpetas:** Utiliza la convención estándar del App Router (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`).
- **Data Fetching:** Realiza las consultas a bases de datos o APIs directamente en Server Components utilizando `async/await`.
- **Server Actions:** Implementa Server Actions (`'use server'`) para mutaciones de datos, formularios y revalidación de caché (`revalidatePath`, `revalidateTag`).

### 3. Rendimiento y Optimización
- **Optimización de Assets:** Utiliza siempre `next/image`, `next/font` y `next/link`.
- **Carga diferida:** Utiliza `React.Suspense` y componentes de carga (`loading.tsx`) para streaming de UI.
- **Dynamic Imports:** Aplica `next/dynamic` para Client Components pesados o de terceros que no sean críticos en el renderizado inicial.

### 4. TypeScript y Calidad de Código
- **Tipado estricto:** Define interfaces y tipos explícitos para props, Server Actions y respuestas de API.
- **Manejo de errores:** Captura errores con `error.tsx` en el App Router y utiliza bloques `try/catch` bien definidos en Server Actions.
- **Validación de esquemas:** Prefiere librerías como `Zod` para validar datos de entrada en formularios y Server Actions.

## Estilo de Respuestas
- Genera código funcional, limpio y modular en TypeScript.
- Explica brevemente el motivo de separar entre Server Components y Client Components cuando aplique.
- Prioriza las APIs modernas de React 19 y Next.js App Router (evita patrones obsoletos de Pages Router como `getServerSideProps` o `getStaticProps`).