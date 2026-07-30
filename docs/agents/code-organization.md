# Organización de código: feature-based

> Parte de [AGENTS.md](../../AGENTS.md) — ver el índice ahí para el resto de los documentos.

- Agrupar por dominio de negocio en `features/<dominio>/`, no por tipo de archivo ni por
  capas técnicas.
- Dominios actuales: `auth`, `perfil`, `puestos`, `postulaciones`, `moderacion`.
- No usar convenciones de Atomic Design (`atoms/`, `molecules/`, `organisms/`).
- **Nombre de archivo: `kebab-case` siempre**, incluidos los componentes (`vacancy-table.tsx`,
  `role-guard.tsx`, `auth-layout.tsx`) — ya era el criterio dominante en el repo antes de
  este párrafo. El nombre del componente exportado sigue en `PascalCase` de React
  (`export function VacancyTable`); lo que cambia es solo el nombre de archivo, no el
  identificador.
