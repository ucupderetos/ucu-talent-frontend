# Fetching de datos: TanStack Query

> Parte de [AGENTS.md](../../AGENTS.md) — ver el índice ahí para el resto de los documentos.

Confirmado por el equipo. Toda lectura de la API va por `useQuery`, toda escritura por
`useMutation`. **No usar `useEffect` + `useState` para traer datos.**

- Los hooks de datos viven en **`features/<dominio>/hooks/`**, uno por caso de uso
  (`use-feed.ts`, `use-postulantes.ts`). Los componentes llaman al hook, nunca a
  `apiClient` directo.
- El `QueryClient` y sus defaults están en **`app/providers.tsx`**, un solo lugar para
  toda la app: `staleTime` de 1 min, sin reintentos en 4xx (un 401/403 no cambia solo),
  y **mutaciones sin retry** (reintentar puede duplicar una postulación o un puesto).
  Si un caso necesita otro comportamiento, se pisa en su `useQuery`, no en los defaults.
- **Convención de query keys**: `["<dominio>", ...discriminantes]` — `["sesion"]`,
  `["puestos", filtros]`, `["puestos", id]`, `["postulantes", puestoId]`. Exportar la key
  desde el hook para poder invalidarla desde otro lado.
- **No hace falta un Context por dominio.** Query ya deduplica por `queryKey`: si 10
  componentes usan `useSession()`, el `GET /me` se hace una vez. Por eso `use-session.ts`
  es un hook y no un provider.
