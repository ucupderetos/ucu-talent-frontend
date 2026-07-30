<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md — UCU Talent (Frontend)

> Decisiones de arquitectura del equipo. Mantener al día a medida que se tomen nuevas
> decisiones. `CLAUDE.md` referencia este archivo — editar acá, no allá.
>
> **2026-07-30: el contenido se movió a `docs/agents/`.** Este archivo quedó como índice —
> cada sección vive ahora en su propio doc, enlazado abajo. Al editar una decisión, el
> archivo a tocar es el de `docs/agents/`, no este.

## Cómo usar este archivo

Antes de escribir código, **abrí el doc de la tabla que cubra lo que vas a tocar** — la
decisión ya está tomada ahí y no se deduce del código. Como mínimo: un formulario →
`forms.md`; un fetch → `data-fetching.md`; cualquier cosa visual → `design-system.md`; un
archivo nuevo → `folder-structure.md`; un endpoint → `docs/ENDPOINTS.md` y
`sources-and-precedence.md`.

[`agent-rules.md`](docs/agents/agent-rules.md) es el resumen de reglas "siempre / nunca" y
conviene tenerlo leído siempre, no solo cuando aplica. Si algo que necesitás está en
[`open-questions.md`](docs/agents/open-questions.md), **se frena y se pregunta** — está
listado justamente porque falta definirlo.

## Índice

| Documento | Qué cubre |
|---|---|
| [`docs/agents/sources-and-precedence.md`](docs/agents/sources-and-precedence.md) | Las tres fuentes externas (SRS, MER, `ENDPOINTS.md`) y su orden de precedencia; la "Fuente #4" (código fuente del backend). |
| [`docs/agents/project-context.md`](docs/agents/project-context.md) | Qué es UCU Talent y el alcance de este repo (solo frontend). |
| [`docs/agents/language-conventions.md`](docs/agents/language-conventions.md) | Identificadores en inglés, valores de enum en español/MAYÚSCULA, y por qué no se traducen. |
| [`docs/agents/stack.md`](docs/agents/stack.md) | Next.js 16, Tailwind v4, shadcn sobre Radix (no Base UI), TanStack Query, RHF + Zod v4. |
| [`docs/agents/design-system.md`](docs/agents/design-system.md) | Guía de estilo de componentes: colores, tipografía, tamaños de control, barras de filtros, espaciado, radios, header dinámico + breadcrumb, estados. |
| [`docs/agents/data-fetching.md`](docs/agents/data-fetching.md) | TanStack Query: convención de hooks, query keys, `QueryClient`. |
| [`docs/agents/forms.md`](docs/agents/forms.md) | React Hook Form + Zod v4, y por qué `components/ui/field` reemplaza a `form`. |
| [`docs/agents/nextjs-architecture.md`](docs/agents/nextjs-architecture.md) | Por qué Next.js se usa como router + guard de rol, no como motor SSR. |
| [`docs/agents/code-organization.md`](docs/agents/code-organization.md) | Organización feature-based, `kebab-case`, dominios actuales. |
| [`docs/agents/roles-and-access-control.md`](docs/agents/roles-and-access-control.md) | Roles y RBAC, registro en dos pasos + `ProfileGuard`, por qué no hay `proxy.ts`/`middleware.ts`, las tres capas de acceso, cookie `httpOnly`. |
| [`docs/agents/applications-state-machine.md`](docs/agents/applications-state-machine.md) | Máquina de estados de `VacancyApplication` (`PENDIENTE`/`VISTO`/`FINALIZADO`) y el campo `accepted`. |
| [`docs/agents/mails.md`](docs/agents/mails.md) | Los dos correos automáticos (ambos del backend) y por qué no se implementa `MailTemplate`. |
| [`docs/agents/folder-structure.md`](docs/agents/folder-structure.md) | Estructura de carpetas del repo y dónde va cada tipo (`types/` vs `features/<x>/types.ts`). |
| [`docs/agents/agent-rules.md`](docs/agents/agent-rules.md) | Reglas "siempre" / "nunca" para el agente. |
| [`docs/agents/team-workflow.md`](docs/agents/team-workflow.md) | Cómo se reparte el trabajo (por rol) vs. cómo se organiza el código (por dominio), y zonas de conflicto. |
| [`docs/agents/branch-and-commit-naming.md`](docs/agents/branch-and-commit-naming.md) | Prefijos de rama y formato de commit. |
| [`docs/agents/repo-status.md`](docs/agents/repo-status.md) | Qué ya existe en el repo, y el estado del backend de desarrollo (`api-dev`, CORS, cookies). |
| [`docs/agents/open-questions.md`](docs/agents/open-questions.md) | Ítems `A-XX`: qué está resuelto/confirmado contra el backend y qué sigue abierto. |
| [`docs/agents/out-of-scope.md`](docs/agents/out-of-scope.md) | Qué queda explícitamente fuera de este proyecto. |

Ver también [`docs/ENDPOINTS.md`](docs/ENDPOINTS.md) — el contrato de API vigente (fuente
#3 de [`sources-and-precedence.md`](docs/agents/sources-and-precedence.md)).
