# Stack

> Parte de [AGENTS.md](../../AGENTS.md) — ver el índice ahí para el resto de los documentos.

Instalado y en uso:

- Next.js 16 (App Router) + React 19, TypeScript
- Tailwind CSS v4
- shadcn/ui sobre **Radix** (paquete `radix-ui`), style `radix-nova`,
  preset `b1Ymqvgm0` (tema blue, tipografía Inter, radius medium)
- **TanStack Query v5** — toda la capa de fetching CSR
- **React Hook Form + Zod v4** (`@hookform/resolvers`) — todos los formularios
- `sonner` (toasts). ✅ `next-themes` (dependencia transitiva que arrastraba —
  el componente `sonner` de shadcn lo importaba solo para leer el tema) se
  sacó: sin dark mode activado (los tokens `.dark` de `globals.css` siguen sin
  nada que los dispare), era peso muerto. `components/ui/sonner.tsx` quedó con
  `theme="system"` fijo en vez de `useTheme()`.

⚠️ **Zod es v4, no v3.** La mayoría de los tutoriales y respuestas de IA asumen v3, que
tiene otra API. Ante la duda, chequear la doc de v4 antes de copiar un snippet.

## shadcn: Radix, no Base UI

El default actual de shadcn (`--defaults` → `--preset=base-nova`) instala **Base UI**,
no Radix. Este proyecto usa **Radix a propósito**: casi todo el material de referencia
(tutoriales, Stack Overflow, asistentes de IA) asume Radix, y para un equipo de 3 grupos
esa diferencia cuesta horas.

Consecuencias prácticas — **no ignorar**:

- Para composición se usa **`asChild`**, no el `render={<Componente />}` de Base UI.
- Si corrés `shadcn init` de nuevo, va **`--base radix`**. Sin ese flag vuelve a
  `base-nova` y rompe todos los `asChild` del repo.
- Agregar componentes: `npx shadcn add <nombre>` (usa el binario local, no `@latest`,
  para no mezclar versiones).
- La paleta se cambia con `npx shadcn apply <preset> --only theme`, no editando
  `globals.css` a mano.
