# Estructura de carpetas

> Parte de [AGENTS.md](../../AGENTS.md) — ver el índice ahí para el resto de los documentos.

**No hay `src/`: la raíz del repo es el src.** El alias `@/*` apunta a la raíz (`./*`).

```
                            # ⛔ NO hay proxy.ts (ni middleware.ts). Se borró: no puede
                            #    leer la cookie (vive en el dominio de la API) y causaba
                            #    un loop de redirección — ver "El acceso se valida
                            #    en tres capas" en roles-and-access-control.md
.env.example                # Plantilla de variables — copiar a .env.local
docs/                       # Documentación del repo — no entra en la imagen Docker
├── agents/                 # ⚠️ Las decisiones de arquitectura, un doc por sección.
│                           #    Indexadas desde AGENTS.md (raíz): editar acá, no ahí
└── ENDPOINTS.md            # ⚠️ Contrato de API vigente (fuente #3)
app/                        # Rutas (App Router) — casi sin lógica de negocio
├── (auth)/                 # ⚠️ layout.tsx: GuestOnly (si ya hay sesión, redirige)
│   └── {login,registro}/   # registro = wizard multi-paso (user → login → perfil)
├── completar-perfil/       # ⛔ NO EXISTE. FUERA de los route groups, si no ProfileGuard
│                           #    la redirige a sí misma en loop
├── (alumno)/               # ⚠️ layout.tsx: RoleGuard + ProfileGuard
│   └── {feed,postulaciones}/
├── (empresa)/              # ⚠️ layout.tsx: RoleGuard + ProfileGuard
│   └── puestos/[id]/postulantes/
├── (perfil)/               # ⚠️ layout.tsx: RoleGuard ALUMNO+EMPRESA + ProfileGuard.
│   └── perfil/             #    /perfil COMPARTIDA por los dos roles: la page ramifica
│                           #    por rol. No puede vivir en (alumno) ni (empresa) — dos
│                           #    page.tsx de groups distintos no resuelven a la misma URL
├── (admin)/                # ⚠️ layout.tsx: RoleGuard (sin ProfileGuard)
│   └── moderacion/
├── layout.tsx              # ⚠️ Layout raíz: fuentes, Providers, Toaster
├── providers.tsx           # ⚠️ QueryClient + defaults globales de TanStack Query
└── page.tsx                # Home (/)
components/
├── ui/                     # shadcn — no editar a mano, se regenera vía CLI
└── layout/                 # ⚠️ Navbar, sidebar, shells — compartidos entre roles
    └── nav-items.ts        # ⚠️ Fuente única de los items de nav por rol
features/<dominio>/         # auth, perfil, puestos, postulaciones, moderacion
├── components/             # Componentes propios del dominio
├── hooks/                  # Hooks de datos (useQuery/useMutation) del dominio
└── types.ts                # Tipos ESPECÍFICOS del dominio (no las entidades core)
hooks/                      # ⚠️ Hooks app-wide (React) que cruzan dominios: capa de
│                           #    sesión (use-session, use-current-company, use-logout)
│                           #    y la lectura de archivos: use-profile-image (foto: la
│                           #    usan Navbar + 2 dominios) y use-cv (CV: perfil del
│                           #    alumno + detalle del postulante).
│                           #    NO van en lib/ (sin React) ni en components/. Un hook de
│                           #    UN solo dominio va en features/<x>/hooks/
lib/
├── api-client.ts           # ⚠️ Wrapper de fetch hacia la API de Spring Boot
├── auth.ts                 # ⚠️ Sesión, usuario actual, guards de rol
└── utils.ts                # cn() — lo genera shadcn
types/
└── index.ts                # ⚠️ Entidades core del modelo de datos
```

**⚠️ = punto de conflicto entre los 3 grupos: coordinar antes de tocar.**

Qué va en cada lado:

- **`app/`** — solo routing y composición. Una carpeta = un segmento de URL; la ruta
  existe recién cuando la carpeta tiene un `page.tsx`. Páginas delgadas: importan de
  `features/` y componen. Sin lógica de dominio ni fetching acá.
- **`(paréntesis)`** — route group: agrupa por rol sin agregar segmento a la URL.
  `app/(alumno)/feed/` sirve `/feed`, no `/alumno/feed`.
- **`[corchetes]`** — segmento dinámico (`/puestos/123/postulantes`).
- **`features/<dominio>/`** — el default: ante la duda, va acá y no en `app/` ni en
  `components/`.
- **`components/layout/`** — UI compartida entre roles, **sin lógica de dominio**. En la
  práctica: no lee *quién* está logueado — `Navbar` recibe el usuario **por props**, y se
  lo pasa el layout del route group. **Nunca importa desde `features/`.** Sí puede usar
  hooks de infra app-wide de `hooks/` (ej. `useLogout` en el botón de "Cerrar sesión" del
  Navbar/Sidebar): esos son infra transversal, no un dominio — la línea que no se cruza es
  `features/`, no `hooks/`. Leer la identidad sigue llegando por props; disparar una acción
  de sesión (logout) es distinto de leer la sesión.
- **`components/ui/`** — la genera el CLI de shadcn; no crearla a mano.
- **`lib/`** — infraestructura transversal, **sin UI ni React**. Por eso `lib/auth.ts`
  tiene solo funciones puras (`obtenerUsuarioActual`, `puedeAcceder`), y el hook que las
  consume vive en `hooks/use-session.ts`.
- **`hooks/`** — hooks **app-wide** (transversales a los dominios) que dependen de React,
  así que no pueden vivir en `lib/` (sin React) ni en `components/` (UI que no lee la
  sesión). Hoy: la capa de sesión (`use-session.ts`, `use-current-company.ts`,
  `use-logout.ts`) y la **lectura** de archivos del storage (`use-profile-image.ts`,
  `use-cv.ts` — las *mutaciones* de esos mismos archivos sí viven en
  `features/perfil/hooks/`, porque solo las dispara ese dominio).
  No es un cajón para cualquier hook: si un hook es de un solo dominio,
  va en `features/<x>/hooks/`. Solo sube acá lo que lo consumen **varios dominios o
  `components/`** y no tiene otro hogar legal — es lo que evita tanto el import cruzado
  `features/A → features/B` como el `components/ → features/` (ese fue el caso de
  `use-logout.ts`: lo consumen `navbar`/`sidebar`, que no pueden importar de `features/`).
- **`types/index.ts`** — **entidades core del modelo de datos**: las que cruzan dominios.

## Dónde va cada tipo: `types/` vs `features/<x>/types.ts`

Esto se deduce de la regla *"no importar desde `features/` de otro dominio"*, y conviene
tenerlo explícito porque si no cada grupo lo resuelve distinto:

- **`types/index.ts` → entidades core: espejan las tablas del MER.** `Vacancy` la usan
  `puestos` (CRUD), `moderacion` (RF-MOD-02) y `postulaciones` (una postulación es *a una
  vacante*). Si viviera en `features/puestos/types.ts`, esos imports estarían
  **prohibidos** por la regla. Lo mismo con `StudentProfile` (lo ve la empresa en sus
  postulantes), `Education`, `WorkExperience` y `Area`.
  Hoy: `Role: enum(ALUMNO, EMPRESA, ADMIN)`,
  `AccountStatus: enum(PENDIENTE, APROBADO, RECHAZADO)`,
  `DocumentType: enum(CEDULA_IDENTIDAD, DNI, PASAPORTE)`, `Department`, `User`, `Admin`,
  `Area` (jerárquica: `parentAreaId`), `Company`, `StudentProfile`, `UniversityRegistry`
  (el padrón — tabla de consulta, sin FK a `User`), `Degree`, `Education`,
  `WorkExperience`, `Modality: enum(PRESENCIAL, HIBRIDO, REMOTO)`,
  `VacancyStatus: enum(PENDIENTE, PUBLICADO, FINALIZADO)`,
  `ContractType: enum(FULL_TIME, PART_TIME, FREELANCE, PASANTIA, CONTRATO_FIJO,
  CONTRATO_INDEFINIDO, SUPLENCIA, BECA)`, `Vacancy`,
  `VacancyApplicationStatus: enum(PENDIENTE, VISTO, FINALIZADO)`, `VacancyApplication`
  (con `accepted` — ver [Postulaciones](applications-state-machine.md)), `Paginated<T>`.
- **`features/<x>/types.ts` → lo específico del dominio**: filtros, payloads de formulario,
  view models. No cruzan a otro dominio, así que no suben.

> **Cambios respecto de la versión anterior de esta lista**, por si hay código escrito
> contra ella:
> - `CompanyStatus` y `StudentProfileStatus` → **se unifican en `AccountStatus`**, que
>   vive en `User` y llega en `GET /me`.
> - `VacancyApplicationStatus` deja de tener `ACEPTADO`/`RECHAZADO` → es
>   `PENDIENTE, VISTO, FINALIZADO` (masculino, no `FINALIZADA` — corregido tras verificar
>   contra el enum fuente del backend). El flag de resultado sí existe: se llama `accepted`,
>   no `selected` — ver [Postulaciones](applications-state-machine.md).
> - **`MailTemplate` se elimina.** Ver [Mails](mails.md).
> - Se agrega `Admin` (perfil con PK compartida, mismo patrón que los otros dos).

> Los grupos se reparten por **rol**, pero el código se organiza por **dominio**, y no son
> la misma línea: `features/puestos/` lo tocan los tres. Por eso las entidades core y los
> enums se acordaron **antes** de repartir el trabajo.
