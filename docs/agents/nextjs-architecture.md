# Next.js: router y guard de acceso, no motor SSR

> Parte de [AGENTS.md](../../AGENTS.md) — ver el índice ahí para el resto de los documentos.

- Casi todo el contenido está detrás de login → no hay SEO que ganar.
- Los datos son personalizados por usuario/rol → no hay nada estático para cachear.
- **El fetching de datos de negocio se hace en Client Components (`"use client"`)**, no en
  Server Components, salvo que se justifique explícitamente un caso puntual y se discuta
  con el equipo antes. Ese fetching se maneja con **TanStack Query** — ver
  [Fetching de datos](data-fetching.md).
- El valor real de Next.js acá es: route groups por rol y layouts anidados para control de
  acceso — no el renderizado del lado del servidor. ⚠️ Antes esta línea incluía `proxy.ts`;
  ese guard se borró (no puede leer la cookie cross-domain, ver
  [Roles y control de acceso](roles-and-access-control.md) — "El acceso se valida en tres
  capas"), así que el control de acceso de UX es 100% client-side (`RoleGuard`).
- (RNF-08 pide feed <2s con hasta 200 puestos, sin exigir SSR para lograrlo — no cambia
  esta decisión, las otras razones siguen aplicando igual.)
