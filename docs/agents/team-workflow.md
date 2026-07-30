# Convención de trabajo en equipo

> Parte de [AGENTS.md](../../AGENTS.md) — ver el índice ahí para el resto de los documentos.

- Una pantalla = una carpeta de ruta; quien la toma es dueño de ese `page.tsx`.
- La lógica va en `features/<x>/`, no en la carpeta de ruta: así dos personas en dominios
  distintos casi no tocan los mismos archivos.

## Los grupos van por rol, el código va por dominio

**No son la misma línea, y esa es la principal fuente de conflicto:**

| Dominio | alumno | empresa | admin |
|---|---|---|---|
| `puestos` | feed, ver detalle | crear/editar/cerrar | moderar (dar de baja a revisión) |
| `postulaciones` | postularse, ver estado | postulantes: marcar `VISTO` | — |
| `perfil` | dueño | ve perfiles de postulantes | — |
| `moderacion` | — | — | dueño |

`features/puestos/` lo tocan los tres grupos. Por eso las **entidades core y los enums se
acordaron antes de repartir**: si cada grupo definía su propio `Puesto`, en una semana
había tres tipos incompatibles.

## Zona de conflicto — coordinar antes de tocar

- `types/index.ts` — las entidades core; las usan los 3 grupos.
- `components/layout/` — sobre todo `nav-items.ts` (fuente única del nav por rol).
- `lib/` — `api-client.ts`, `auth.ts`.
- `app/layout.tsx`, `app/providers.tsx` y los 5 `layout.tsx` de route group (incluido el
  de `(perfil)`, compartido entre alumno y empresa) — son del equipo, no del grupo del rol
  correspondiente. Tocar los defaults del `QueryClient` afecta a los tres grupos a la vez.
- ~~`proxy.ts`~~ — ya no aplica: el archivo se borró y no se vuelve a crear (ver
  [Roles y control de acceso](roles-and-access-control.md) — "El acceso se valida en tres
  capas"). Si alguien lo reintroduce, es zona de conflicto: Next admite **uno** por
  proyecto.
