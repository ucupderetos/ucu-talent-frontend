<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md — UCU Talent (Frontend)

> Decisiones de arquitectura del equipo. Mantener al día a medida que se tomen nuevas
> decisiones. `CLAUDE.md` referencia este archivo — editar acá, no allá.

### Las tres fuentes y su orden de precedencia

Este documento se sincroniza contra tres artefactos externos que **no siempre coinciden
entre sí**. Cuando se contradicen, gana el de más abajo:

| # | Fuente | Qué es | Cuándo gana |
|---|---|---|---|
| 1 | **SRS v2.1** (`UCU_Talent_SRS_v2.docx`) | Requerimientos (RF-AUT, RF-PER, RF-PUE, RF-MOD, RF-FEED, RF-POS), reglas de negocio (RN) y decisiones (DEC) | Reglas de negocio y comportamiento de UI |
| 2 | **MER** (`plantuml_export.puml`) | Modelo de datos aprobado | Forma de las entidades. **Es posterior al SRS** y ya lo revierte en varios puntos |
| 3 | **`ENDPOINTS.md`** | Lo que el backend expone **hoy** | Contrato real: paths, schemas, enums, permisos |

En la práctica: el SRS dice *qué* tiene que pasar, el MER dice *cómo se modela*, y
`ENDPOINTS.md` dice *contra qué podemos programar ahora mismo*. Si `ENDPOINTS.md` todavía
no tiene algo que el SRS pide, se documenta como pendiente y **no se implementa** hasta
que exista — no se inventa el endpoint.

⚠️ El MER es más nuevo que el SRS y **revierte** parte de él: elimina `MailTemplate`,
saca los datos personales de `User`, agrega la entidad `Admin`, agrega
`Vacancy_Application.selected` y agrega un segundo correo automático. Esos puntos del SRS
están desactualizados y se van a corregir en una revisión posterior del documento.

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
| **Valores de enum** | **Español y en MAYÚSCULA**, tal como los manda el backend |
| **Comentarios y documentación** | Español |
| **URLs y texto de UI** | Español (son cara al usuario: `/feed`, `/perfil`, "Mis postulaciones") |
| **Ramas y commits** | Inglés |

Los **nombres** de tipos y campos espejan el MER en inglés: `Vacancy` (no "Puesto"),
`status` (no "estado"), `StudentProfile.documentNumber`.

Los **valores** de los enums van en español y en mayúscula, exactamente como llegan de la
API — **no se traducen ni se mapean**:

```ts
type Role = "ALUMNO" | "EMPRESA" | "ADMIN";           // no "student" | "company" | "admin"
type AccountStatus = "PENDIENTE" | "APROBADO" | "RECHAZADO";
type VacancyStatus = "PUBLICADO" | "RECHAZADO" | "FINALIZADO";
type Modality = "PRESENCIAL" | "HIBRIDO" | "REMOTO";
type DocumentType = "CEDULA_IDENTIDAD" | "DNI" | "PASAPORTE";
```

El criterio: un mapeo entre `"student"` y `"ALUMNO"` es una capa de traducción que hay que
mantener sincronizada en los tres grupos y que solo produce bugs. Se paga el costo de la
inconsistencia estética una vez, en este párrafo. Para mostrarle el valor al usuario se usa
un diccionario de presentación en el componente, no un cambio del tipo.

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

## Guía de estilo de componentes (UI)

> Objetivo: que un componente nuevo (lo arme una persona o la IA) se vea como si lo
> hubiera hecho el mismo equipo que hizo el resto. Esto documenta lo que **ya existe** en
> `app/globals.css` y `components/ui/` — no inventa un sistema de diseño paralelo. Ante la
> duda entre "lo que dice acá" y "lo que ya hace un componente de `components/ui/`", gana
> el componente: esta guía se corrige, no se la fuerza.

### Colores

Todo color va por **token semántico** (`bg-primary`, `text-muted-foreground`,
`border-border`, `bg-destructive/10`...), nunca un hex u oklch suelto en un componente.
Los tokens ya están declarados en `app/globals.css` — un componente no declara los suyos.

| Rol | Token / utilidad | Cuándo |
|---|---|---|
| Acción primaria | `bg-primary` / `text-primary` / `ring-ring` | Botón principal, focus ring, links — es **navy** (`--brand-navy`, `#052E66`). |
| Acción secundaria | `bg-secondary` | Botón secundario, sin protagonismo visual (gris neutro, no de marca). |
| Texto apagado / ayuda | `text-muted-foreground` | Descripciones, helper text, metadata. |
| Fondo sutil | `bg-muted` / `bg-accent` | Hover de filas, fondos de sección, superficies de bajo contraste. |
| Error / destructivo | `bg-destructive` / `text-destructive` | Estados de error, botones destructivos, `aria-invalid`. |
| Bordes | `border-border` (general) / `border-input` (controles de formulario) | Nunca un gris arbitrario (`border-gray-200`, etc.). |

**Los 3 colores de marca** (`bg-ucu-blue`, `bg-ucu-orange`, `bg-ucu-teal`, y sus
variantes `text-*`/`border-*`) son para **superficies de marca explícitas** — el panel
hero de `(auth)`, ilustraciones, acentos puntuales (los puntitos de color de
`AuthLayout`) — no un reemplazo puntual de `bg-primary` porque "queda lindo". Si el rol es
"botón principal" o "focus ring", va `bg-primary`/`ring-ring`, no `bg-ucu-blue` a mano:
como `--primary`/`--ring` ya **son** navy, es exactamente el mismo resultado visual sin
repetir el color en cada componente.

`ucu-teal` es el único color de marca con un rol semántico fijo fuera de "acento": es
`--sidebar-primary`/`--sidebar-ring` (el ítem activo del Sidebar), porque el Sidebar ya es
navy de fondo — un ítem activo navy sobre navy no se vería. `ucu-orange` no tiene token
semántico propio: es acento puntual (dots, texto destacado), nunca un fondo grande ni un
botón — es el color más saturado de los tres y compite con el contenido si se usa de más.

⚠️ Herencia de una decisión anterior: hasta hace poco `--primary`/`--ring` eran un teal de
marca oscurecido (para dar contraste con texto blanco) y `login-form.tsx`/`register-form.tsx`
pisaban el navy a mano en cada input (`focus-visible:border-ucu-blue
focus-visible:ring-ucu-blue/20`) porque esa pantalla ya es navy-forward. Ahora que
`--primary`/`--ring` son navy por default, esos overrides quedaron **redundantes** — no
hace falta tocarlos para que este ticket cierre, pero si se edita ese archivo por otra
razón, se pueden borrar sin que cambie nada visualmente.

### Tipografía

Una sola familia, **Inter**, vía `--font-sans` (la trae el layout raíz,
`app/layout.tsx`). `font-heading` hoy apunta a la misma variable — no hay una tipografía
de títulos distinta todavía; si se agrega una, el punto de cambio es esa variable en
`app/globals.css`, no cada componente.

| Uso | Clases | Ejemplo real |
|---|---|---|
| Título de página | `text-2xl font-semibold tracking-tight` | `PageHeader` (`h1`) |
| Bajada de página | `text-sm text-muted-foreground` | `PageHeader` (`p`, con `mt-1`) |
| Título de card | `font-heading text-base font-medium` | `CardTitle` |
| Cuerpo / texto de control | `text-sm` (formularios: `text-base` en el input, `md:text-sm`) | `Input`, `CardDescription` |
| Label de campo | `text-sm font-medium` | `FieldLabel` / `FieldTitle` |
| Ayuda / error de campo | `text-sm text-muted-foreground` (error: `text-destructive` vía `data-[invalid=true]`) | `FieldDescription` |
| Texto de badge/pill | `text-xs font-medium` | `Badge` |

⚠️ **El encabezado de una pantalla es siempre `PageHeader`** (`components/layout/page-header.tsx`)
— título + bajada opcional + acciones. No se crea un componente nuevo por pantalla o por
rol (tipo `DashboardHeader`) aunque sea solo para admin: es exactamente el caso que
`PageHeader` existe para evitar (ver el comentario en el propio archivo). Si hace falta un
acento visual que `PageHeader` no tiene, se agrega ahí — no se bifurca el componente.

### Tamaño de controles interactivos

Los primitivos de `components/ui/` (`Button`, `Input`, `SelectTrigger`) traen por default
un tamaño compacto (`h-8`) pensado para UI densa. Conviven dos contextos con necesidades
distintas, y **ambos son correctos** — no hay que unificarlos a un solo alto:

- **Formulario de página completa** (login, registro, completar perfil: la persona
  completa el formulario y listo, nada más en pantalla): controles más grandes y
  táctiles. Estándar: **`h-11`** en `Input`/`SelectTrigger` (con `px-4 text-base`), **`h-12`**
  en el botón de submit principal. Se aplica con `className` en el sitio de uso — **no** se
  edita el default de `components/ui/` a mano (esa regla de arriba sigue aplicando).
- **Barra de filtros / tabla densa** (`vacancy-filters.tsx`, `vacancy-feed-filters.tsx`,
  `vacancy-table.tsx`): se deja el tamaño default de los primitivos (`h-8`). Es una barra de
  herramientas sobre una lista, no un formulario — la densidad ahí es una ventaja, no un
  descuido.

⚠️ **Gotcha de `SelectTrigger`**: su tamaño no es una clase `h-*` común, es
`data-[size=default]:h-8` / `data-[size=sm]:h-7` (variantes por atributo). Un `className="h-11"`
suelto **no le gana** a ese default — `tailwind-merge` solo dedupea clases con el mismo
prefijo de variante. Hay que pisarlo con el mismo prefijo: `className="data-[size=default]:h-11"`
(ver `register-form.tsx` para el patrón ya en uso).

**Pendiente de aplicar** (no se toca en este ticket, queda registrado): `complete-profile-form.tsx`
es un formulario de página completa igual que `register-form.tsx`, pero todavía usa los
tamaños default de los primitivos en vez de `h-11`/`h-12` — falta alinearlo.

### Barras de filtros / toolbars

Cualquier fila de búsqueda + filtros (feed, "Mis ofertas", listados futuros de admin) sigue
siempre el mismo layout — dos partes con roles fijos que no se intercambian:

- **Búsqueda + filtros van agrupados a la izquierda.** El buscador tiene un ancho fijo y
  compacto (no `flex-1` estirándose a lo ancho del contenedor).
- **Los filtros van detrás de un único botón "Filtros"** (`FilterIcon` + label, con un
  `Badge` de conteo si hay filtros activos) que abre un `Popover` — no selects sueltos
  siempre visibles en la barra. Un control de **orden** (`Select` de "Más recientes"/"Más
  antiguas"/etc.), si la pantalla lo tiene, queda visible fuera del popover: ordenar no es
  lo mismo que filtrar.
- **Cada filtro dentro del popover es un `MultiSelect`** (más de un valor a la vez — ej.
  varias carreras, varios tipos de contrato): pinta y comportamiento de `SelectTrigger`
  (Radix `Select` no soporta multi-valor, por eso es un combobox armado con
  `Popover` + `Command` — ver `features/puestos/components/multi-select.tsx`), con el
  trigger resumiendo la selección (`"2 seleccionadas"`). No un `Select` de valor único
  suelto en la barra. Dentro de la lista desplegable, **cada opción muestra su propio
  `Checkbox`** (visual, `pointer-events-none` — el click lo maneja el `CommandItem`) para
  que se entienda de un vistazo que se puede tildar más de una. El filtro pasa a ser un
  array (`areaIds?: string[]`, no `areaId?: string`) y el filtrado en memoria matchea por
  pertenencia (`.includes(...)`), no por igualdad.
- **La acción primaria de la pantalla (crear, publicar) va siempre arriba a la derecha**,
  en el `actions` de `PageHeader` — nunca en la misma fila que los filtros. Estas dos
  posiciones (filtros a la izquierda, acción primaria arriba a la derecha) no se tocan.

```tsx
<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
  <div className="relative w-full sm:w-64">
    {/* Input con ícono de búsqueda */}
  </div>
  {/* Select de orden acá, si existe */}
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="outline">
        <FilterIcon />
        Filtros
        {activeCount > 0 && <Badge variant="secondary">{activeCount}</Badge>}
      </Button>
    </PopoverTrigger>
    <PopoverContent align="start" className="flex w-72 flex-col gap-3">
      {/* Un Label + <MultiSelect className="w-full" ... /> por filtro */}
    </PopoverContent>
  </Popover>
</div>
```

Ver `vacancy-feed-filters.tsx` y `vacancy-filters.tsx` para el patrón ya aplicado.

### Espaciado

No hay tokens de espaciado propios: se usa la escala default de Tailwind
(`gap-1`, `gap-2`, `gap-3`...) de forma consistente por nivel:

| Nivel | Clase | Dónde |
|---|---|---|
| Página → header | `mb-6` | Separación entre `PageHeader` y el contenido de la página. |
| Contenedor de página | `p-4 md:p-6` | `<main>` de `AppShell` — el padding de toda pantalla autenticada. |
| Entre secciones de una página | `gap-6` | Bloques grandes dentro de una pantalla (ver `VacancyFeedView`). |
| Grillas de cards | `gap-4` | `grid` de resultados (feed, tablas en tarjetas). |
| Barra de filtros / toolbar | `gap-2` a `gap-3` | Entre controles de una misma fila de filtros. |
| Dentro de un `Card` | `--card-spacing` (`--spacing(4)`, o `--spacing(3)` con `size="sm"`) | No pisar el padding del `Card` a mano — usar la prop `size`. |
| Entre campos de un formulario | `FieldGroup` (`gap-5`) / `Field` (`gap-2` label↔control) | Usar `Field`/`FieldGroup` de `components/ui/field`, no `space-y-*` a mano. |

### Bordes y radios

`--radius` es `0.625rem` (10px), con una escala derivada en `app/globals.css`
(`--radius-sm` = ×0.6 hasta `--radius-4xl` = ×2.6). Un componente nuevo no inventa un
radio: usa la utilidad que ya le corresponde a su tipo.

| Componente | Radio |
|---|---|
| `Button`, `Input`, `Textarea`, `SelectTrigger` | `rounded-lg` |
| `Card` | `rounded-xl` |
| `Badge` (pill) | `rounded-4xl` (full) |
| `EmptyState` (caja con borde punteado) | `rounded-lg border-dashed` |

Color de borde: siempre `border-border` (contenedores) o `border-input` (controles de
formulario) — nunca un gris arbitrario.

### Header dinámico + breadcrumb (🚧 documentado, todavía NO implementado)

> No tocar `components/layout/navbar.tsx` por esto todavía — queda anotado acá para
> cuando se decida encarar, igual que las demás decisiones de esta guía que están
> "pendientes de aplicar". Es zona de conflicto (los 3 grupos comparten `Navbar`):
> coordinar antes de implementarlo.

Hoy `Navbar` muestra un título fijo, `"UCU Talent"`, en las tres secciones. La decisión
es reemplazarlo por:

- **En una pantalla de listado** (`/feed`, `/puestos`, `/moderacion`...): el título de la
  sección activa — mismo ícono + label que ya tiene resaltado el item activo del
  Sidebar/Sheet (`NAV_BY_ROLE` en `components/layout/nav-items.ts`, matcheado contra
  `pathname`). Una sola fuente para el label, no un texto nuevo hardcodeado en `Navbar`.
- **En una pantalla de detalle anidada** (ej. el detalle de una vacante): un breadcrumb
  `Sección > Nombre del ítem` — el segmento de la sección como link, el último segmento
  (el ítem actual) en texto/negrita sin link, sin ícono de flecha entre medio más que un
  separador simple (`>` o `ChevronRightIcon`).

Aplica **a las 3 secciones por igual** (alumno, empresa, admin) — no es un ajuste puntual
de una pantalla.

### Estados de los componentes

La mayoría de los estados ya vienen resueltos en los primitivos de `components/ui/` —
**no se repiten a mano** en cada uso:

- **Focus**: `focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50`
  — ya está en `Button`/`Input`/`Textarea`/`SelectTrigger`. Como `--ring` ya es navy, no
  hace falta (ni se debe) pisarlo con un color de marca a mano — ver el aviso de
  *Colores* arriba.
- **Disabled**: `disabled:opacity-50 disabled:pointer-events-none` — ya en los primitivos.
- **Inválido / error**: `aria-invalid:border-destructive aria-invalid:ring-3
  aria-invalid:ring-destructive/20` — se dispara solo con el atributo `aria-invalid`, que
  `Field`/`FieldError` ya conectan a los errores de RHF. No se pinta un borde rojo a mano
  por `className`.
- **Hover**: cada `variant` de `Button`/`Badge` ya define el suyo (`hover:bg-primary/80`,
  etc.) — no se agrega un `hover:` suelto salvo un caso puntual sin variant que lo cubra.
- **Carga, en un botón de submit**: `disabled={isLoading}` + el label cambia a gerundio +
  puntos suspensivos (`"Guardando..."`, `"Iniciando sesión..."`, `"Creando cuenta..."`) —
  sin ícono de spinner. Ver `login-form.tsx`, `register-form.tsx`,
  `complete-profile-form.tsx`.
- **Carga, de una sección o página**: `<Skeleton>` con el mismo tamaño y radio que el
  contenido final (no un spinner centrado), mostrado mientras `isLoading` de la query. Ver
  `GridSkeleton` en `vacancy-feed-view.tsx` o `AuthFormSkeleton` en `auth-layout.tsx`.
- **Vacío**: `EmptyState` (ícono + título + bajada opcional + acción opcional) — no un
  `<div>` armado a mano por pantalla.

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
- (RNF-08 pide feed <2s con hasta 200 puestos, sin exigir SSR para lograrlo — no cambia
  esta decisión, las otras razones siguen aplicando igual.)

### Organización de código: feature-based

- Agrupar por dominio de negocio en `features/<dominio>/`, no por tipo de archivo ni por
  capas técnicas.
- Dominios actuales: `auth`, `perfil`, `puestos`, `postulaciones`, `moderacion`.
- No usar convenciones de Atomic Design (`atoms/`, `molecules/`, `organisms/`).
- **Nombre de archivo: `kebab-case` siempre**, incluidos los componentes (`vacancy-table.tsx`,
  `role-guard.tsx`, `auth-layout.tsx`) — ya era el criterio dominante en el repo antes de
  este párrafo. El nombre del componente exportado sigue en `PascalCase` de React
  (`export function VacancyTable`); lo que cambia es solo el nombre de archivo, no el
  identificador.

### Roles y control de acceso (RF-AUT-05, RBAC)

- 3 roles: **`ALUMNO`**, **`EMPRESA`**, **`ADMIN`**. Cada uno ve solo lo que le
  corresponde.
- **El estado de aprobación vive en `User`, no en el perfil.** Un único
  `AccountStatus: enum(PENDIENTE, APROBADO, RECHAZADO)` para los tres roles, y **llega en
  `GET /me`**. Esto reemplaza a los dos enums separados que había antes
  (`CompanyStatus` / `StudentProfileStatus`) y también al booleano `Company.approved` del
  MER viejo.
- **Toda cuenta nace `PENDIENTE`.** No hay aprobación automática: la vía
  `@ucu.edu.uy` que preveía el SRS (RF-AUT-01, RN-01) **se descartó**. Todo alumno se
  registra igual, con documento, y queda `PENDIENTE` hasta que se resuelva su validación
  contra el padrón (ver *Pendiente de aclarar* — el mecanismo todavía no está definido).
- **El estado no restringe el acceso, restringe la acción.** Es el mismo criterio para
  los dos roles:
  - Alumno `PENDIENTE` o `RECHAZADO`: entra, arma su perfil, navega el feed y ve el
    detalle de los puestos. **No puede postularse** (RN-16, RF-AUT-06).
  - Empresa `PENDIENTE` o `RECHAZADA`: entra y gestiona su ficha. **No puede publicar
    puestos** (RN-02, RF-MOD-04). El gate es sobre la empresa, no sobre cada puesto.
  - En ambos casos la UI muestra el estado de forma permanente y, si el Admin lo
    registró, el motivo.
- Los `layout.tsx` de `(alumno)` y `(empresa)` validan **rol**, no estado. El estado se
  chequea en el punto de acción (el botón de postularse, el de publicar), porque bloquear
  la ruta entera contradiría RN-16 y RN-02.
- Vacante (`Vacancy`): **post-moderación (DEC-01)** — nace ya `PUBLICADO` al crearse, sin
  aprobación previa por puesto (RN-03). Admin UCU revisa periódicamente lo ya publicado y
  puede darlo de baja (→ `RECHAZADO`, terminal, RF-MOD-02). La empresa dueña lo puede
  cerrar cuando termina la búsqueda (→ `FINALIZADO`, terminal, RF-PUE-03). Ambos son
  terminales y cada uno solo lo puede disparar su actor (RN-07). Estados:
  `enum(PUBLICADO, RECHAZADO, FINALIZADO)` — **sin `pending` ni `paused`**.
  Impacto: el panel de admin es una **bandeja de revisión de lo ya publicado** (para dar
  de baja si corresponde, con las últimas 24h destacadas — RF-MOD-01), no una cola de
  aprobación previa. La empresa ve su vacante viva apenas la crea, si ya está aprobada.
- Cada route group (`(auth)`, `(alumno)`, `(empresa)`, `(admin)`) lleva su propio
  `layout.tsx` que valida el rol antes de renderizar. Ya existen: son de 3 líneas y
  delegan en `RoleGuard` (`features/auth/components/role-guard.tsx`).

#### Registro en dos pasos y `ProfileGuard`

**El registro son tres llamadas encadenadas**, y el orden no es negociable: `POST /user`
devuelve `201` pero **no** setea cookie, y `POST /student-profile` exige sesión
(`🔒 rol ALUMNO`). Así que hay que loguearse en el medio:

```
POST /user            → 201   (email, password, role)
POST /auth/login      → 200   + Set-Cookie httpOnly   ← obligatorio, no es opcional
POST /student-profile → 201   (o POST /company, según el rol)
```

**Los datos mínimos del paso 2 son obligatorios para los dos roles.** Son exactamente los
campos `@NotBlank` que ya exige `ENDPOINTS.md` — ni uno más:

| Rol | Campos del paso 2 |
|---|---|
| `ALUMNO` | `name`, `surname`, `documentType`, `documentNumber` |
| `EMPRESA` | `name` (razón social), `industry`, `description`, `webUrl`, `linkedinUrl`, `location` |

Todo lo demás (teléfono, LinkedIn del alumno, skills, descripción, foto) es opcional y se
completa después desde `/perfil`.

**Se implementa en dos capas, y hacen falta las dos:**

1. **El wizard** — `/registro` es un formulario multi-paso en una sola pantalla, sin
   navegación entre medio. Es el camino feliz y cubre el 95% de los casos.
2. **`ProfileGuard`** — la red que atrapa al que cerró la pestaña entre el paso 1 y el 2.
   Esa cuenta queda huérfana (existe en `User`, sin perfil) y **puede loguearse igual**,
   porque `POST /auth/login` solo mira `User`. Sin el guard, ese usuario entra a la app sin
   `studentProfileId` y revienta la mitad de las pantallas.

`ProfileGuard` vive en `features/perfil/components/`, y lo montan **`(alumno)/layout.tsx`
y `(empresa)/layout.tsx`** — no `(admin)`. La asimetría por rol sale gratis de los route
groups: no hace falta un solo `if (role === ...)`.

```tsx
// app/(alumno)/layout.tsx
<RoleGuard role="ALUMNO">
  <ProfileGuard>{children}</ProfileGuard>
</RoleGuard>
```

Dos detalles que **no se pueden resolver de otra forma**:

- **`/completar-perfil` va FUERA de los route groups.** Si estuviera dentro de `(alumno)`,
  el guard la redirigiría a sí misma en loop infinito. Lleva su propio chequeo de rol y
  renderiza el mismo paso 2 del wizard.
- **`proxy.ts` no sirve para esto.** Solo puede leer la cookie; no sabe si hay perfil.
  `ProfileGuard` es client-side, sí o sí.

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

#### Auth: cookie `httpOnly` — ✅ confirmado

Ya no es una asunción: `ENDPOINTS.md` lo define.

- `POST /auth/login` devuelve `200` + **`Set-Cookie` httpOnly** con el JWT.
  `POST /auth/logout` la vence. Ambos son públicos.
- **Consecuencia forzosa: el cliente no puede leer el token ni el rol.** La única forma
  de saber quién es el usuario es preguntándoselo al backend.
- **`GET /me`** (`🔒 Autenticado`) devuelve `MeResponse`:
  ```ts
  { userId, email, role: Role, status: AccountStatus, registeredAt }
  ```
  El `status` se lee fresco de la BD en cada llamada, nunca del JWT — así una aprobación
  del Admin se refleja sin reloguear. Lo consume
  `features/auth/hooks/use-session.ts`, una sola vez para toda la app (Query deduplica por
  `queryKey`).
- **`MeResponse` NO trae `name`.** El navbar necesita el nombre, así que hoy hace falta un
  segundo fetch al perfil según el rol (`GET /student-profile?userId={id}` o
  `GET /company?userId={id}`). Está pedido como cambio a backend — ver *Pendiente de
  aclarar*.
- **PK compartida**: `studentProfileId === userId` y `companyId === userId`. No hace falta
  guardar un id de perfil aparte ni resolverlo con una llamada extra.
- `lib/api-client.ts` manda `credentials: "include"` para que el browser adjunte la cookie
  en cross-origin.

### Postulaciones: máquina de estados y `selected`

```
VacancyApplicationStatus: enum(PENDIENTE, VISTO, FINALIZADO)
selected: boolean   // default false, independiente del status
```

| Transición | Disparador | Actor |
|---|---|---|
| (alta) → `PENDIENTE` | el alumno se postula | Alumno |
| `PENDIENTE` → `VISTO` | la empresa abre el perfil del postulante | Empresa dueña |
| `VISTO` → `FINALIZADO` | **automático**, en cascada al finalizar el puesto | Sistema |

- **`selected` solo se puede setear en `VISTO`.** Es el momento en que la empresa revisa y
  marca su elección. Una vez que el puesto se finaliza, queda congelado.
- `selected` es **independiente del status**: no altera la máquina de estados. Por eso no
  hay `ACEPTADO`/`RECHAZADO` — esa alternativa se descartó (DEC-06).
- El estado **nunca retrocede** (RN-08).
- Un alumno no puede postularse dos veces al mismo puesto: `UNIQUE (vacancy_id,
  student_profile_id)` (RN-05). El segundo intento devuelve `409`.

### Mails: los dos son del backend, el frontend no manda ninguno

**El frontend no participa de ningún envío de correo.** No arma `mailto:`, no tiene
templates, no muestra previews. Si aparece código de correo en este repo, está de más.

Los dos correos automáticos del sistema, ambos desde Spring Boot:

1. **Nueva postulación → a la empresa** (RF-POS-01, RN-18). Nombre del puesto, nombre y
   apellido del postulante, fecha, skills coincidentes y un link a la app. El link exige
   login si no hay sesión y luego redirige al destino (DEC-11) — **nunca** un token sin
   autenticación, para no filtrar el perfil de un alumno a quien reenvíe el mail. Envío
   asíncrono: un fallo del proveedor nunca bloquea ni revierte el registro de la
   postulación (RNF-14). `notified_at` da idempotencia.
2. **Cierre del puesto → a cada postulante** (según el MER). Al finalizar la vacante, el
   sistema manda un no-reply por postulante, con contenido según su `selected`.
   `result_notified_at` da idempotencia.

> ⚠️ **Esto revierte dos cosas que decía antes esta sección.** (a) Que el alumno nunca
> recibía correo automático: ahora sí lo recibe, al cerrarse el puesto. (b) Que la empresa
> contactaba al alumno con un `mailto:` precargado desde sus `MailTemplate`.
>
> **`MailTemplate` se elimina del modelo** y con ella RF-PUE-05 (ABM de templates) y
> RF-POS-04 (`mailto:`). El SRS v2.1 todavía las tiene; el MER las sacó y el MER es
> posterior. **No implementar ninguna de las dos.**
>
> El contacto empresa → alumno pasa a ocurrir **enteramente fuera del sistema**: la empresa
> ve los datos del alumno en su perfil y le escribe por su cuenta. El frontend solo muestra
> el email; no ofrece ninguna acción de contacto.

## Estructura de carpetas

**No hay `src/`: la raíz del repo es el src.** El alias `@/*` apunta a la raíz (`./*`).

```
proxy.ts                    # ⛔ TODAVÍA NO EXISTE. Guard optimista (era middleware.ts)
.env.example                # Plantilla de variables — copiar a .env.local
app/                        # Rutas (App Router) — casi sin lógica de negocio
├── (auth)/                 # ⚠️ layout.tsx: GuestOnly (si ya hay sesión, redirige)
│   └── {login,registro}/   # registro = wizard multi-paso (user → login → perfil)
├── completar-perfil/       # ⛔ NO EXISTE. FUERA de los route groups, si no ProfileGuard
│                           #    la redirige a sí misma en loop
├── (alumno)/               # ⚠️ layout.tsx: RoleGuard + ProfileGuard
│   └── {feed,perfil,postulaciones}/
├── (empresa)/              # ⚠️ layout.tsx: RoleGuard + ProfileGuard
│   └── puestos/[id]/postulantes/
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
  `VacancyStatus: enum(PUBLICADO, RECHAZADO, FINALIZADO)`, `Vacancy`,
  `VacancyApplicationStatus: enum(PENDIENTE, VISTO, FINALIZADO)`, `VacancyApplication` (con
  `selected: boolean`), `Paginated<T>`.
- **`features/<x>/types.ts` → lo específico del dominio**: filtros, payloads de formulario,
  view models. No cruzan a otro dominio, así que no suben.

> **Cambios respecto de la versión anterior de esta lista**, por si hay código escrito
> contra ella:
> - `CompanyStatus` y `StudentProfileStatus` → **se unifican en `AccountStatus`**, que
>   vive en `User` y llega en `GET /me`.
> - `VacancyApplicationStatus` deja de tener `ACEPTADO`/`RECHAZADO` → es
>   `PENDIENTE, VISTO, FINALIZADO` + el flag `selected`.
> - **`MailTemplate` se elimina.** Ver *Mails*.
> - Se agrega `Admin` (perfil con PK compartida, mismo patrón que los otros dos).

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
  y Safari** (RNF-06, RNF-07) — obligatorio, no opcional. No asumir layouts fijos de
  escritorio; usable desde 360px de ancho.
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
- **No armar `mailto:` ni nada de correo desde el frontend** — los dos correos del sistema
  los manda Spring Boot. Ver *Mails*.
- **No implementar `MailTemplate`, RF-PUE-05 ni RF-POS-04** — están en el SRS v2.1 pero el
  MER los eliminó y el MER es posterior.
- **No traducir los NOMBRES del modelo al español** — los tipos y campos espejan el MER en
  inglés. Los **valores** de enum sí van en español y en mayúscula, como los manda el
  backend: `"ALUMNO"`, no `"student"`. Ver *Idioma del código*.
- **No implementar nada de la sección *Pendiente de aclarar*** — está listado justamente
  porque falta definirlo. Si algo lo necesita, se frena y se pregunta.
- **No inventar endpoints que `ENDPOINTS.md` no tiene** — si el SRS pide algo que la API
  todavía no expone, se documenta como pendiente y se para ahí.
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
| `puestos` | feed, ver detalle | crear/editar/cerrar | moderar (dar de baja) |
| `postulaciones` | postularse, ver estado | postulantes: marcar `VISTO`, `selected` | — |
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
- `lib/api-client.ts`: la **forma** del cliente (verbos, `ApiError`, base URL). Faltan los
  endpoints, pero **el contrato ya existe**: `ENDPOINTS.md`.
- `lib/auth.ts` + `features/auth/`: sesión vía `GET /me` (`hooks/use-session.ts`) y
  guards de rol (`components/role-guard.tsx`, `components/guest-only.tsx`).
- `.env.example`, `lib/fixtures.ts` y el modo sesión mock.
- ✅ **`ProfileGuard`** (`features/perfil/components/ProfileGuard.tsx`) y la ruta
  **`app/completar-perfil/page.tsx`** — ver *Registro en dos pasos y ProfileGuard*.
  Montado en `(alumno)/layout.tsx` y `(empresa)/layout.tsx`, adentro de `RoleGuard`.
- ✅ **El registro real, en 3 llamadas encadenadas** (`use-register.ts`):
  `POST /user` → `POST /auth/login` → `POST /student-profile`/`POST /company`. El
  perfil pide los campos mínimos `@NotBlank` de `docs/ENDPOINTS.md` en el mismo
  formulario de `/registro` (un solo paso visual, sin navegación entre medio).
  `features/perfil/hooks/use-complete-profile.ts` reintenta solo el paso 3 desde
  `/completar-perfil`.

**Todavía NO existe:**

- **`proxy.ts`** — no hay ninguna primera línea de defensa. Va en rama `feature/`, no
  `chore/`: es funcionalidad.
- **`features/<x>/hooks/`** — vacíos salvo `auth`, `perfil` (`use-complete-profile.ts`) y
  `puestos` (`use-company-vacancies.ts`, `use-current-company.ts`, todavía sobre fixtures).
  Ya se pueden escribir contra `ENDPOINTS.md`. `features/auth/hooks/use-session.ts` sirve
  de plantilla del patrón.
- ✅ **`app/(empresa)/puestos/page.tsx`** — ya existe ("Mis ofertas"), construida por el
  grupo de empresa. ⚠️ Ver el gap de `VacancyStatus` en *Roles y control de acceso*: la
  pantalla hoy colapsa todo a `PENDIENTE`/`FINALIZADO` porque el backend real no tiene más
  estados — revisar labels/acciones apenas exista `PUBLICADO`/`RECHAZADO` (A-14).
- Las `page.tsx` de `/feed`, `/perfil`, `/postulaciones` y
  `/puestos/[id]/postulantes` siguen siendo placeholders.

### El backend ya está levantado

**`https://api-dev.ucutalent.tech/`** — entorno de desarrollo, en pie.
Swagger UI: `https://api-dev.ucutalent.tech/swagger-ui/index.html` (el `/v3/api-docs`
crudo pide sesión).

```bash
cp .env.example .env.local
NEXT_PUBLIC_API_URL=https://api-dev.ucutalent.tech
```

⚠️ **La cookie cross-origin es el primer problema a resolver.** El front corre en
`http://localhost:3000` y la API en `https://api-dev.ucutalent.tech` — dominios distintos.
Para que el browser acepte y reenvíe la cookie de sesión hacen falta **las dos puntas**:

- Backend: `Set-Cookie` con `SameSite=None; Secure`, y CORS con
  `Access-Control-Allow-Credentials: true` + `Allow-Origin` explícito
  (con credenciales, `*` no sirve).
- Front: `credentials: "include"` — eso ya lo hace `lib/api-client.ts`.

Si el login "funciona" pero `GET /me` devuelve 401 en la llamada siguiente, es esto y no
otra cosa. Ver `A-13`.

### Modo mock (en retirada)

Sigue existiendo mientras la cookie cross-origin no ande:

```bash
NEXT_PUBLIC_MOCK_SESSION=ALUMNO   # o EMPRESA | ADMIN
```

Saltea el `GET /me` y devuelve un usuario de `lib/fixtures.ts`. **No es seguridad**: solo
cambia lo que el frontend *cree* que sos, el backend no lo mira.

**Ahora que la API existe, esto es deuda con fecha de vencimiento.** Apenas el login real
funcione contra `api-dev`, se borran `lib/fixtures.ts`, `NEXT_PUBLIC_MOCK_SESSION` y sus
usos en `lib/auth.ts` y `features/auth/hooks/use-logout.ts`.

✅ **La migración a `Role: ALUMNO|EMPRESA|ADMIN` ya se hizo** en `lib/auth.ts`,
`lib/fixtures.ts` y `.env.example` (ver *Idioma del código*) — ya no queda código usando
los literales viejos (`student`/`company`/`admin`).

## Pendiente de aclarar

> 🚧 **Nada de esta sección se implementa todavía.** Está acá justamente porque falta
> definirlo. Si una tarea depende de alguno de estos puntos, se frena y se pregunta —
> no se elige una interpretación y se sigue.

### 🔴 Bloquean código del front

| # | Qué falta | Impacto |
|---|---|---|
| **A-01** | **Cómo se aprueba a un alumno.** Dos opciones sobre la mesa: endpoint de la UCU que valida cédula (aprobación automática) o revisión manual del Admin contra el padrón. | Define si el grupo de admin construye la cola de solicitudes (RF-MOD-05/06) y si `UniversityRegistry` sigue existiendo en el modelo. |
| **A-02** | **Endpoints de moderación.** Hoy no hay forma de cambiar el `status` de `User`/`Company`/`Vacancy`, ni de registrar `admin_comment`/`reviewed_at`. Backend está trabajando en ellos. | El dominio `moderacion` no puede escribir un solo hook. |
| **A-03** | **Formato de `skills` en el wire.** ¿`string[]` JSON (como hoy en `/student-profile`) o string separado por comas (DEC-03)? ¿Y quién normaliza (RN-11), backend o front? Además `Vacancy` hoy **no tiene** `skills`, sin lo cual RF-FEED-01 (orden por coincidencia) no se puede calcular. | Tipo en `types/index.ts` + el feed entero. |
| **A-04** | **Contrato de paginación.** Confirmado que el feed va paginado, pero no la forma: nombres de parámetros y envoltorio de respuesta. | `Paginated<T>` está tipado pero sin contrato real detrás. |
| **A-05** | **Contrato de filtros del feed.** El SRS pide filtros combinables (área con subáreas, carrera, contrato, modalidad, localidad, keyword) + orden configurable. La API de hoy acepta **un query param por vez** y no tiene keyword, `contractType`, carrera ni ordenamiento. | Sin un endpoint de feed real, el feed del SRS no se puede construir. |
| **A-13** | **Cookie cross-origin contra `api-dev`.** Confirmar que el backend manda `SameSite=None; Secure` y tiene CORS con `Allow-Credentials: true` + origin explícito para `http://localhost:3000`. | Sin esto no hay sesión real y el modo mock no se puede retirar. Es lo primero a probar. |
| **A-14** | **`VacancyStatus` del backend no es el acordado.** Hoy expone `PENDIENTE, FINALIZADO` y el `POST` fuerza `PENDIENTE` — o sea, **pre-moderación**. Lo acordado es post-moderación: `PUBLICADO, RECHAZADO, FINALIZADO`, publicando al crear (DEC-01, RN-03). | Todo lo que este documento dice sobre moderación es falso contra la API actual: el feed, la bandeja de admin y el alta de puesto. |
| **A-15** | **Campos finales de `Vacancy`.** Hoy `contractType` es string libre (vs. enum `PASANTIA/FULL_TIME/PART_TIME/ZAFRAL`), el salario es un `salaryRange` string único (vs. `salaryMin`/`salaryMax`/`currency`) y `location` es `@NotNull` (vs. nullable cuando la modalidad es `REMOTO`, RF-PUE-01). | El formulario de alta de puesto no se puede construir: cambia la cantidad de inputs, los tipos y las validaciones de Zod. |
| **A-16** | **Nombre de la cookie de sesión.** `ENDPOINTS.md` dice que el login setea una cookie httpOnly, pero no cómo se llama. | `proxy.ts` solo puede leer la cookie por nombre — sin ese dato no se puede escribir el guard optimista. |

### 🟠 Contrato incompleto

| # | Qué falta | Impacto |
|---|---|---|
| **A-17** | **`selected` no existe en el backend.** No está en `VacancyApplicationResponse` ni en `UpdateVacancyApplicationRequest`. Tampoco está claro si la cascada `VISTO → FINALIZADO` al cerrar el puesto está implementada. | La empresa no puede marcar su elección — ver *Postulaciones*. |
| **A-18** | **`CompanyResponse` no expone `status`.** El `AccountStatus` llega en `GET /me`, que es el propio usuario. Pero el Admin necesita ver el estado de **cada** empresa en su listado (RF-MOD-03). | El listado de empresas del admin no puede mostrar ni filtrar por estado. |
| **A-19** | **Formato de error de la API.** ¿Qué devuelve un `400` de validación? Para cumplir RNF-05 ("el error se muestra junto al campo") hace falta un error por campo, no un string suelto. | Define la forma de `ApiError` en `lib/api-client.ts` y cómo se mapea a `setError` de RHF. |

### 🟡 Definiciones de UI

| # | Qué falta |
|---|---|
| **A-06** | **Qué campos de un puesto quedan editables** antes de la primera postulación (RN-06). El SRS lo deja abierto (`"Description, requirements,..."`). Hace falta la lista para deshabilitar los inputs. |
| **A-07** | **¿Se exige ≥1 registro de educación para postularse?** Lo pide RF-FEED-04, el backend no lo valida. Si se mantiene, se chequea antes de habilitar el botón. |
| **A-08** | **`PUT`/`PATCH` de `StudentProfile`.** `ENDPOINTS.md` dice explícitamente que no existe. Sin él, el alumno **no puede editar su perfil** — el dominio `perfil` no puede escribir nada. `Company` sí tiene `PUT`. |

### 🟢 Menores

| # | Qué falta |
|---|---|
| **A-09** | **`GET /me` no devuelve `name`.** Pedido a backend: agregarlo a `MeResponse` (y de paso un `hasProfile: boolean`, que le ahorra a `ProfileGuard` un fetch por carga). Mientras tanto, el navbar hace un segundo fetch al perfil. |
| **A-20** | **Datos semilla de `Area` y `Degree` en `api-dev`.** ¿Están cargados? Sin ellos, los selects de área (alta de puesto, filtros del feed) y de carrera (educación del perfil) quedan vacíos y no se puede probar nada de punta a punta. Es el riesgo R-06 del SRS. |
| **A-10** | **Contrato del documento.** Confirmados los tres tipos (`CEDULA_IDENTIDAD`, `DNI`, `PASAPORTE`) + número. Falta: si el número es único global o por tipo, y las reglas de validación por tipo. |
| **A-11** | **Contrato de subida de archivos.** El MER tiene `profileImageUrl`, `logoUrl` y `cvUrl`, pero no hay endpoint de upload. Falta el mecanismo (multipart al backend vs. URL prefirmada) y los límites. |
| **A-12** | **Gaps de autorización del backend.** `ENDPOINTS.md` marca varios `⚠️ Sin restricción` (education, degree, area, university-registry) y `PUT`/`DELETE /vacancy` sin ownership. Este documento afirma que "la autorización real la hace Spring Boot" — hoy no se cumple del todo. Es transitorio, pero conviene no asumirlo resuelto. |

## Fuera de alcance del proyecto

Según el SRS v2.1: integración en vivo con la API de LinkedIn, video-CV, interfaz tipo
"Tinder del empleo", chat en tiempo real, motor de recomendación con IA/ML/ranking
automático de candidatos, notificaciones in-app y push, pagos/suscripciones/pasarela de
pagos, recuperación de contraseña por correo (identificada como evolución posterior al
MVP), ABM del padrón en la interfaz, testing automatizado, CI/CD y despliegue en la nube.

Además, **descartado por decisión posterior al SRS**:

- **`MailTemplate`, RF-PUE-05 y RF-POS-04** — no hay ABM de templates ni `mailto:`. El
  contacto empresa → alumno ocurre enteramente fuera del sistema. Ver *Mails*.
- **La vía de registro por `@ucu.edu.uy`** (RF-AUT-01, RN-01a) — no hay aprobación
  automática por dominio de correo. Toda cuenta nace `PENDIENTE`.
- **`VacancyApplicationStatus` con `ACEPTADO`/`RECHAZADO`** — es `PENDIENTE, VISTO, FINALIZADO`
  más el flag `selected`.

Los correos automáticos son **dos** y los manda el backend: aviso de nueva postulación a
la empresa, y aviso de cierre a cada postulante según su `selected`. El frontend no manda
ninguno. Ningún otro evento dispara un envío.
