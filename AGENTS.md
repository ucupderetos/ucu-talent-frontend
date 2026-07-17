<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md — UCU Talent (Frontend)

> Decisiones de arquitectura del equipo. Actualizado tras el documento de
> requerimientos **v3**. Mantener al día a medida que se tomen nuevas decisiones.
> `CLAUDE.md` referencia este archivo — editar acá, no allá.

## Contexto del proyecto

Portal laboral tipo LinkedIn para la UCU: conecta empresas, alumnos/egresados y
administración universitaria. El backend (Java + Spring Boot) expone una API REST
separada — **este repositorio es solo el frontend**, no genera su propio backend
ni accede directamente a la base de datos.

## Idioma del código

Confirmado por el equipo:

| Qué | Idioma |
|---|---|
| **Identificadores** (tipos, funciones, variables, props) | **Inglés**, espejando el MER |
| **Comentarios y documentación** | Español |
| **URLs y texto de UI** | Español (son cara al usuario: `/feed`, `/perfil`, "Mis postulaciones") |
| **Ramas y commits** | Inglés |

El modelo de datos **espeja el MER tal cual**: `Vacancy` (no "Puesto"), `status` (no
"estado"), `role: "student" | "company" | "admin"` (no "alumno"). Así no hay que traducir
en cada capa ni mantener un mapeo.

⚠️ Las carpetas de `features/` siguen en español (`puestos`, `postulaciones`, `perfil`,
`moderacion`) — renombrarlas es una decisión aparte que el equipo todavía no tomó.

## Stack

Instalado y en uso:

- Next.js 16 (App Router) + React 19, TypeScript
- Tailwind CSS v4
- shadcn/ui sobre **Radix** (paquete `radix-ui`), style `radix-nova`,
  preset `b1Ymqvgm0` (tema blue, tipografía Inter, radius medium)
- **TanStack Query v5** — toda la capa de fetching CSR
- **React Hook Form + Zod v4** (`@hookform/resolvers`) — todos los formularios
- `sonner` (toasts) — arrastró `next-themes` como dependencia transitiva:
  el componente `sonner` de shadcn lo importa para leer el tema. Los tokens
  `.dark` existen en `globals.css` pero **nada los activa todavía**. Si no se
  hace dark mode, `next-themes` es peso muerto y se puede sacar.

⚠️ **Zod es v4, no v3.** La mayoría de los tutoriales y respuestas de IA asumen v3, que
tiene otra API. Ante la duda, chequear la doc de v4 antes de copiar un snippet.

### shadcn: Radix, no Base UI

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

## Fetching de datos: TanStack Query

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

## Formularios: React Hook Form + Zod

Confirmado por el equipo. Formularios con RHF + Zod (v4), no estado a mano.

⚠️ **`components/ui/form` NO existe en esta versión de shadcn** — el item del registry está
vacío. Lo reemplaza **`components/ui/field`** (`Field`, `FieldLabel`, `FieldError`,
`FieldGroup`, `FieldSet`…), que es **agnóstico de librería**: no depende de RHF. Se
conecta a mano — `FieldError` recibe un array `{ message }`, que es la forma que ya tienen
los errores de RHF.

> Si buscás `FormField` / `useFormField` de los tutoriales de shadcn: no están acá.
> Ese componente es del shadcn viejo sobre Radix+RHF. Usá `field`.

## Decisiones de arquitectura

### Next.js: router y guard de acceso, no motor SSR

- Casi todo el contenido está detrás de login → no hay SEO que ganar.
- Los datos son personalizados por usuario/rol → no hay nada estático para cachear.
- **El fetching de datos de negocio se hace en Client Components (`"use client"`)**, no en
  Server Components, salvo que se justifique explícitamente un caso puntual y se discuta
  con el equipo antes. Ese fetching se maneja con **TanStack Query** — ver *Fetching de
  datos*.
- El valor real de Next.js acá es: route groups por rol, layouts anidados y `proxy.ts`
  para control de acceso — no el renderizado del lado del servidor.
- (v3 bajó el requisito de rendimiento del feed a "opcional" — no cambia esta decisión,
  las otras razones siguen aplicando igual.)

### Organización de código: feature-based

- Agrupar por dominio de negocio en `features/<dominio>/`, no por tipo de archivo ni por
  capas técnicas.
- Dominios actuales: `auth`, `perfil`, `puestos`, `postulaciones`, `moderacion`.
- No usar convenciones de Atomic Design (`atoms/`, `molecules/`, `organisms/`).

### Roles y control de acceso (RF-03, RBAC)

- 3 roles: **alumno**, **empresa**, **admin**. Cada uno ve solo lo que le corresponde.
- Alumno: se valida contra padrón de cédulas o mail `@ucu` (RF-01).
- Empresa: se registra o es invitada, y **necesita aprobación de Admin UCU antes de
  poder operar** (RF-13) — el gate de aprobación es sobre la empresa, no sobre cada
  puesto individual. En el MER es `Company.approved : boolean`.
  ⚠️ Al ser booleano, **"rechazada" y "todavía no revisada" son el mismo valor**: no se
  puede registrar un rechazo. Deuda aceptada por el equipo; si hace falta, se migra a enum.
- Vacante (`Vacancy`): **nace en `pending` y Admin UCU aprueba antes de que salga**.
  Estados del MER: `pending / paused / published / rejected / closed`.

> 🔴 **El documento v3 está desactualizado acá.** Dice que el puesto *"se publica por
> default al crearse"* y que Admin *"no aprueba antes de que salga"*. **Eso es falso**: el
> MER tiene `pending` y el equipo lo confirmó. Falta actualizar el v3.
> Impacto: el panel de admin es una **cola de pendientes** (aprobar/rechazar), no una
> herramienta de despublicar lo ya publicado. Y la empresa no ve su vacante viva hasta
> que la aprueben.
- Cada route group (`(auth)`, `(alumno)`, `(empresa)`, `(admin)`) lleva su propio
  `layout.tsx` que valida el rol antes de renderizar. Ya existen: son de 3 líneas y
  delegan en `RoleGuard` (`features/auth/components/role-guard.tsx`).

#### ⚠️ En Next 16 `middleware.ts` ya no existe: ahora es `proxy.ts`

Next 16 renombró Middleware a **Proxy**. La funcionalidad es la misma, pero **el archivo
tiene que llamarse `proxy.ts`** (en la raíz, al mismo nivel que `app/`) y exportar una
función `proxy`. Un `middleware.ts` **no se ejecuta nunca** — o sea que un guard escrito
ahí no protege nada y falla en silencio. Ver `node_modules/next/dist/docs/01-app/
01-getting-started/16-proxy.md`.

#### El acceso se valida en tres capas, y solo una es seguridad

| Capa | Qué hace | ¿Es seguridad? |
|---|---|---|
| `proxy.ts` | Redirect **optimista** si no hay cookie de sesión | ❌ No |
| `layout.tsx` del route group (`RoleGuard`) | Guard de rol para UX: evita ver pantallas ajenas | ❌ No |
| **Spring Boot** | **Autorización real** | ✅ **Sí** |

Las dos primeras son UX: cualquiera las saltea con las devtools. **El backend tiene que
rechazar toda request que no corresponda, sin importar lo que haga el frontend.**

El doc de Next es explícito: Proxy *"no está pensado como solución completa de manejo de
sesión ni de autorización"*. Corre en cada request, incluidas las prefetcheadas, así que
solo puede **leer la cookie** — nunca pegarle a la base ni a la API.

#### Auth: cookie `httpOnly` (asunción actual)

- El backend **va a intentar** setear el JWT en una cookie `httpOnly`. Falta la
  confirmación final.
- **Consecuencia forzosa: el cliente no puede leer el token ni el rol.** La única forma
  de saber quién es el usuario es preguntándoselo al backend.
- Por eso hace falta un **`GET /me`** que devuelva `{ id, nombre, email, rol }`.
  **Pedírselo al equipo de backend**: sin ese endpoint, los guards de rol y el navbar no
  se pueden construir. Hoy `lib/auth.ts` lo asume y `features/auth/hooks/use-session.ts`
  lo consulta (una sola vez para toda la app: Query deduplica por `queryKey`).
- `lib/api-client.ts` manda `credentials: "include"` para que el browser adjunte la cookie
  en cross-origin. Si el backend termina eligiendo un token en header, eso y `lib/auth.ts`
  son lo único que cambia.
- **Falta definir**: cómo llega el estado de aprobación de la empresa (RF-13) al frontend
  — ¿viene en `GET /me`? El layout de `(empresa)` hoy valida el **rol**, no la aprobación.

### Mails al postulante (RF-21) — CAMBIÓ

🔴 **El flujo `mailto:` quedó descartado. El backend manda el mail.**

- Cuando la empresa pasa una postulación a `FINALIZADO`, elige si sigue o no con el
  candidato. **Esa decisión viaja como un campo del payload del cambio de estado**, y
  Spring Boot se encarga de armar y enviar el mail con la plantilla correspondiente.
- **El frontend no arma, no dispara y no previsualiza mails.** No hay `mailto:`, no hay
  plantillas en el front, y `features/mensajeria/` deja de ser una consideración. La tabla
  `MailTemplate` del MER es asunto del backend.
- Lo único del front es el flag de decisión, en `features/postulaciones/types.ts`
  (`ApplicationStatusChange`).

> ⚠️ Ese flag decide **qué mail le llega a una persona real**. Si va mal, a un candidato
> le llega el mail equivocado. No es un detalle cosmético.

> 📌 **Esto contradice el v3**, que declara el envío automático de correo *fuera de
> alcance* y solo admite `mailto:`. El alcance cambió: envío automático **está adentro**
> (del lado del backend). Falta actualizar el v3.

## Estructura de carpetas

**No hay `src/`: la raíz del repo es el src.** El alias `@/*` apunta a la raíz (`./*`).

```
proxy.ts                    # ⛔ TODAVÍA NO EXISTE. Guard optimista (era middleware.ts)
.env.example                # Plantilla de variables — copiar a .env.local
app/                        # Rutas (App Router) — casi sin lógica de negocio
├── (auth)/                 # ⚠️ layout.tsx: GuestOnly (si ya hay sesión, redirige)
│   └── {login,registro}/
├── (alumno)/               # ⚠️ layout.tsx: RoleGuard
│   └── {feed,perfil,postulaciones}/
├── (empresa)/              # ⚠️ layout.tsx: RoleGuard
│   └── puestos/[id]/postulantes/
├── (admin)/                # ⚠️ layout.tsx: RoleGuard
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
lib/
├── api-client.ts           # ⚠️ Wrapper de fetch hacia la API de Spring Boot
├── auth.ts                 # ⚠️ Sesión, usuario actual, guards de rol
├── fixtures.ts             # 🔴 Datos mock — BORRAR cuando exista el backend
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
  práctica: no lee la sesión. `Navbar` recibe el usuario **por props**, y se lo pasa el
  layout del route group. Por eso `components/` no importa nunca desde `features/`.
- **`components/ui/`** — la genera el CLI de shadcn; no crearla a mano.
- **`lib/`** — infraestructura transversal, **sin UI ni React**. Por eso `lib/auth.ts`
  tiene solo funciones puras (`obtenerUsuarioActual`, `puedeAcceder`), y el hook que las
  consume vive en `features/auth/hooks/use-session.ts`.
- **`types/index.ts`** — **entidades core del modelo de datos**: las que cruzan dominios.

### Dónde va cada tipo: `types/` vs `features/<x>/types.ts`

Esto se deduce de la regla *"no importar desde `features/` de otro dominio"*, y conviene
tenerlo explícito porque si no cada grupo lo resuelve distinto:

- **`types/index.ts` → entidades core: espejan las tablas del MER.** `Vacancy` la usan
  `puestos` (CRUD), `moderacion` (RF-12) y `postulaciones` (una postulación es *a una
  vacante*). Si viviera en `features/puestos/types.ts`, esos imports estarían
  **prohibidos** por la regla. Lo mismo con `StudentProfile` (lo ve la empresa en sus
  postulantes), `Education`, `WorkExperience` y `Area`.
  Hoy: `Role`, `DocumentType`, `Department`, `User`, `Area`, `Company`, `StudentProfile`,
  `Degree`, `Education`, `WorkExperience`, `Modality`, `VacancyStatus`, `Vacancy`,
  `ApplicationStatus`, `VacancyApplication`, `Paginated<T>`.
- **`features/<x>/types.ts` → lo específico del dominio**: filtros, payloads de formulario,
  view models. No cruzan a otro dominio, así que no suben.

> `MailTemplate` del MER **no está tipada**: es asunto del backend, el frontend no arma
> mails. Ver *Mails al postulante*.

> Los grupos se reparten por **rol**, pero el código se organiza por **dominio**, y no son
> la misma línea: `features/puestos/` lo tocan los tres. Por eso las entidades core y los
> enums se acordaron **antes** de repartir el trabajo.

## Reglas para el agente

**Siempre:**

- Antes de crear un componente nuevo, revisar si ya existe algo similar en `features/`
  o en `components/`.
- Todo fetch a la API pasa por `lib/api-client.ts` — nunca `fetch()` suelto dentro de
  un componente.
- Formularios con React Hook Form + Zod, no manejo de estado de formulario a mano.
- Todo fetching por TanStack Query (`useQuery` / `useMutation`), nunca `useEffect` +
  `useState` para traer datos. El hook va en `features/<dominio>/hooks/`.
- El código de un dominio vive en `features/<dominio>/`, no directamente en `components/`.
- Imports con el alias `@/` (`@/features/puestos/types`), no rutas relativas largas.
- **Todo componente debe ser responsive (mobile + desktop) y funcionar en Chrome, Edge
  y Safari** — desde v3 es obligatorio, no opcional. No asumir layouts fijos de escritorio.
- Nunca commitear credenciales, tokens o archivos `.env` — usar variables de entorno.
- Commits pequeños y descriptivos, trabajo en branches con Pull Request y code review.
  Nombrar ramas y commits según *Nomenclatura de ramas y commits* — no improvisar formato.

**Nunca:**

- No agregar Server Components que hagan fetch de datos de negocio sin discutirlo antes
  — rompe el criterio de "CSR por defecto" de arriba.
- No instalar otra librería de componentes sin confirmar — shadcn/ui es la base.
- No modificar `components/ui/` a mano — se regenera vía CLI de shadcn.
- **No correr `shadcn init` sin `--base radix`** — el default vuelve a Base UI y rompe
  todos los `asChild` del repo.
- **No usar `render={<Componente />}`** para composición: eso es Base UI. Acá es `asChild`.
- **No buscar `components/ui/form` ni `FormField`/`useFormField`** — no existen en esta
  versión. El equivalente es `components/ui/field`.
- **No traer datos con `useEffect` + `useState`** — va `useQuery`, en un hook de
  `features/<dominio>/hooks/`.
- **No crear un Context por dominio para cachear datos** — TanStack Query ya deduplica
  por `queryKey`.
- **No copiar snippets de Zod v3** — acá es v4 y la API cambió.
- **No crear `middleware.ts`** — en Next 16 es `proxy.ts`. Un `middleware.ts` no se
  ejecuta y el guard falla en silencio.
- **No confiar en `proxy.ts` ni en los layouts como seguridad** — son UX. La autorización
  real la hace Spring Boot.
- No introducir carpetas tipo `atoms/molecules/organisms`.
- **No implementar `mailto:` ni plantillas de mail en el frontend** — el RF-21 cambió: el
  backend manda el mail. El front solo transmite la decisión (ver *Mails al postulante*).
- **No traducir el modelo de datos al español** — los tipos espejan el MER en inglés.
- No importar desde `features/` de otro dominio. Si algo se comparte, sube a
  `components/`, `lib/` o `types/`.
- **No importar desde `features/` dentro de `components/`** — la dependencia va al revés:
  `features/` → `components/`, nunca al revés.
- **No dejar `lib/fixtures.ts` ni `NEXT_PUBLIC_MOCK_SESSION` vivos** cuando exista el
  backend — son andamio temporal.

## Convención de trabajo en equipo

- Una pantalla = una carpeta de ruta; quien la toma es dueño de ese `page.tsx`.
- La lógica va en `features/<x>/`, no en la carpeta de ruta: así dos personas en dominios
  distintos casi no tocan los mismos archivos.

### Los grupos van por rol, el código va por dominio

**No son la misma línea, y esa es la principal fuente de conflicto:**

| Dominio | alumno | empresa | admin |
|---|---|---|---|
| `puestos` | feed, ver detalle | crear/editar/pausar | moderar, despublicar |
| `postulaciones` | postularse, ver estado | gestionar postulantes, `mailto:` | — |
| `perfil` | dueño | ve perfiles de postulantes | — |
| `moderacion` | — | — | dueño |

`features/puestos/` lo tocan los tres grupos. Por eso las **entidades core y los enums se
acordaron antes de repartir**: si cada grupo definía su propio `Puesto`, en una semana
había tres tipos incompatibles.

### Zona de conflicto — coordinar antes de tocar

- `types/index.ts` — las entidades core; las usan los 3 grupos.
- `components/layout/` — sobre todo `nav-items.ts` (fuente única del nav por rol).
- `lib/` — `api-client.ts`, `auth.ts`.
- `app/layout.tsx`, `app/providers.tsx` y los 4 `layout.tsx` de route group — son del
  equipo, no del grupo del rol correspondiente. Tocar los defaults del `QueryClient`
  afecta a los tres grupos a la vez.
- `proxy.ts` (cuando exista) — Next solo admite **uno** por proyecto.

## Nomenclatura de ramas y commits

Fuente: *Guía de Nomenclatura del Proyecto*. Ramas y commits van **en inglés, en
minúsculas y separando palabras con guiones**.

### Ramas

Se crean **siempre a partir de `dev`**, salvo `hotfix/` que sale de `main`.
Nunca commitear directo a `main` ni a `dev`: siempre rama + Pull Request.

| Prefijo | Para qué | Ejemplo |
|---|---|---|
| `feature/` | Nueva funcionalidad | `feature/sign-in` |
| `bugfix/` | Corregir errores en dev/pruebas | `bugfix/misaligned-text` |
| `hotfix/` | Errores críticos en producción (sale de `main`) | `hotfix/payment-crash` |
| `release/` | Preparar una versión antes de publicarla | `release/v1.0.0` |
| `refactor/` | Reorganizar o mejorar estructura **sin cambiar comportamiento** | `refactor/user-controller` |
| `chore/` | Mantenimiento, configuración, dependencias | `chore/update-dependencies` |
| `docs/` | Cambios exclusivos de documentación | `docs/update-readme` |

Si el cambio **agrega o modifica funcionalidad, va en `feature/`**, no en `refactor/`.

Flujo: `feature/` sale de `dev` y vuelve a `dev` → `release/` sale de `dev` y va a `main`
→ `hotfix/` sale de `main` y vuelve a `main`.

### Commits

Estructura: `tipo(alcance): descripción corta en minúsculas`
El *alcance* es la zona o módulo afectado. **No incluir el ticket en el título** — queda
vinculado a través del nombre de la rama.

| Tipo | Para qué | Ejemplo |
|---|---|---|
| `feat` | Nueva funcionalidad para el usuario | `feat(auth): add google sign in` |
| `fix` | Corrige un error de la aplicación | `fix(payment): fix card processing error` |
| `docs` | Cambios exclusivos de documentación | `docs(readme): update installation steps` |
| `refactor` | Cambios que no añaden funciones ni corrigen errores | `refactor(user): rename confusing variables` |
| `chore` | Mantenimiento, configuración, herramientas | `chore(deps): update axios version` |

## Estado actual del repo

La base compartida **ya está construida** (rama `chore/project-setup`), pensada para que
los 3 grupos puedan trabajar en paralelo sin pisarse.

**Ya existe:**

- `components/ui/`: 16 componentes sobre Radix + tema del preset, incluido `field`
  (el reemplazo de `form`).
- `components/layout/`: `AppShell`, `Navbar`, `Sidebar`, `PageHeader`, `EmptyState`,
  `nav-items.ts`. Responsive, verificado en mobile y desktop.
- `layout.tsx` de los 4 route groups, con `RoleGuard` / `GuestOnly`.
- `app/providers.tsx`: `QueryClient` con los defaults de TanStack Query.
- `types/index.ts` y los 5 `features/<x>/types.ts`.
- `lib/api-client.ts`: la **forma** del cliente (verbos, `ApiError`, base URL). Sin
  endpoints — el contrato de la API no está definido.
- `lib/auth.ts` + `features/auth/`: sesión vía `GET /me` (`hooks/use-session.ts`) y
  guards de rol (`components/role-guard.tsx`, `components/guest-only.tsx`).
- `.env.example`, `lib/fixtures.ts` y el modo sesión mock.

**Todavía NO existe:**

- **`proxy.ts`** — no hay ninguna primera línea de defensa. Va en rama `feature/`, no
  `chore/`: es funcionalidad.
- **El contrato de la API** — sin esto, `api-client.ts` no tiene endpoints y los hooks de
  datos de cada dominio no se pueden escribir. **Es el único bloqueante que queda.**
- **`features/<x>/hooks/`** — vacíos salvo `auth`. Esperan el contrato de la API.
  `features/auth/hooks/use-session.ts` sirve de plantilla del patrón.
- **`app/(empresa)/puestos/page.tsx`** — la ruta `/puestos` está en el nav pero no existe;
  la crea el grupo de empresa.
- Las `page.tsx` de cada ruta siguen siendo placeholders.

### Desarrollo sin backend

Mientras `GET /me` no exista, los guards bloquean todas las rutas protegidas y **no se ve
ninguna pantalla**. Para trabajar:

```bash
cp .env.example .env.local
# y descomentar, con el rol de tu grupo:
NEXT_PUBLIC_MOCK_SESSION=student   # o company | admin
```

Eso saltea el `GET /me` y devuelve un usuario de `lib/fixtures.ts`. **No es seguridad**:
solo cambia lo que el frontend *cree* que sos, el backend no lo mira. Se borra cuando la
API exista.

## Pendiente de aclarar

### ✅ Resueltas por el MER + el equipo

- ~~**Estado de postulación**: RF-20 usa "avanza", el modelo dice "aceptado".~~
  El MER dice `enum(PENDIENTE, VISTO, FINALIZADO)` — ninguno de los dos. Tipado como
  `ApplicationStatus`.
- ~~**Avanza vs. rechazo para el RF-21**~~ → resuelto por diseño: la decisión viaja en el
  payload del cambio de estado y **el backend manda el mail**. El enum no necesita
  distinguirlo. Ver *Mails al postulante*.
- ~~**Orden del feed por "coincidencia" (RF-14)**~~ → el MER tiene `Area` jerárquica
  clasificando **tanto `Degree` como `Vacancy`**: el match es por reglas (área de la
  carrera vs. área de la vacante), no IA/ML. **No choca con "fuera de alcance"**.
- ~~**Notificaciones dentro o fuera de alcance**~~ → el backend manda mails; push sigue
  afuera.

### 🔴 El v3 quedó desactualizado — hay que corregirlo

1. **`Vacancy.status` tiene `pending`**: el v3 dice que el puesto se publica solo al
   crearse. Es falso — Admin UCU aprueba antes.
2. **Envío automático de correo ya no está fuera de alcance**: el backend manda los mails
   del RF-21. El `mailto:` quedó descartado.

### 🟠 Abiertas

- **Formato de import de LinkedIn**: RF-05 dice ZIP/CSV/PDF/txt, el flujo 6.2 dice
  PDF/DOCX. El MER no tiene tabla de archivos importados (solo `User.linkedinUrl`), lo que
  sugiere un alcance liviano. Confirmar con backend.
  Bajó de prioridad Alta a Baja — no bloquea el MVP.
- **`Company.approved` es booleano**: no permite registrar un rechazo. Deuda aceptada.
- **El contrato de la API** — ver los `TODO:` en `types/` y `features/*/types.ts`. Todo lo
  que falta confirmar está marcado ahí.

## Fuera de alcance del proyecto

Según el documento de requerimientos (v3): integración en vivo con la API de LinkedIn,
video-CV, interfaz tipo "Tinder del empleo", chat en tiempo real, motor de recomendación
con IA/ML/ranking automático de candidatos, notificaciones push, pagos/suscripciones,
testing automatizado, CI/CD y despliegue en la nube.

⚠️ **Corrección**: el v3 lista *"envío automático de notificaciones por correo"* como fuera
de alcance. **Ya no lo está**: el backend manda los mails del RF-21 (ver *Mails al
postulante*). Sigue fuera de alcance el push. Falta actualizar el v3.
