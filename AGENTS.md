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

⚠️ **A su vez, `docs/ENDPOINTS.md` (fuente #3, recibido 2026-07-27) parecía revertir uno de
esos puntos del MER**: `selected` no aparecía en ningún lado de esa primera versión del
contrato. Eso se dio por definitivo un tiempo — hasta verificar contra la fuente #4 de
abajo, que lo revierte otra vez: el campo existe, solo que con otro nombre. Ver
*Postulaciones: máquina de estados*.

### Fuente #4 (2026-07-28): el código fuente del backend le gana a su propio `ENDPOINTS.md`

El repo de backend (`ucupderetos/ucu-talent-backend`) tiene **su propio `docs/ENDPOINTS.md`**,
más detallado que la copia local de este repo (`docs/ENDPOINTS.md`, fuente #3) — y las dos
copias **no siempre coinciden entre sí**, y ninguna de las dos coincide siempre con el
código real. Verificado leyendo los DTOs/entidades/servicios del backend directo (`gh api`
contra `ucupderetos/ucu-talent-backend`, rama `dev`) en vez de confiar en cualquiera de los
dos markdown:

- El `ENDPOINTS.md` del backend afirma que `ALUMNO` nace `APROBADO` y `EMPRESA` nace
  `PENDIENTE` — **falso contra su propio código** (`UserServiceImpl.create`: los dos branches
  de rol asignan `PENDIENTE`, sin diferencia real). La copia local de este repo tenía razón.
- El `ENDPOINTS.md` del backend no documentaba que la empresa dueña **no puede** cerrar una
  vacante `PENDIENTE` (solo desde `PUBLICADO`) — confirmado contra `VacancyServiceImpl.
  updateVacancyStatus`, que lo prohíbe con `403`.
- Ninguna de las dos copias de `ENDPOINTS.md` documentaba `Vacancy.publicationDate`/
  `closingDate` (obligatorias al crear, no autogeneradas), que `salary`/`salaryRange` son
  nombres DISTINTOS según el endpoint (`CreateVacancyRequest` vs. `UpdateVacancyRequest`),
  que `contractType` es un enum real (`ContractType.java`), ni el cron de auto-cierre por
  `closingDate`.
- Ninguna de las dos documentaba que `accepted` (ex-`selected` del MER) sí existe en
  `VacancyApplicationResponse`, ni el endpoint dedicado para marcarlo
  (`PATCH /vacancy-application/{id}/accept`).
- `CreateVacancyApplicationRequest.studentProfileId` es `@NotBlank` en el DTO real, aunque
  el controller lo pise con el del token — mandar solo `{ vacancyId }` (lo que indicaban las
  dos copias de `ENDPOINTS.md`) hace fallar la request con `400`.

**Regla práctica desde acá**: cuando se pueda, verificar contra el código fuente del
backend (los DTOs/records y los `*ServiceImpl` son los más confiables — las anotaciones
`@Schema`/`@Operation` de Swagger a veces también mienten) en vez de confiar ciegamente en
cualquiera de los dos `ENDPOINTS.md`. Cuando el código fuente no está a mano, la copia
local de `docs/ENDPOINTS.md` (fuente #3) sigue siendo el mejor default — pero un aviso de
"ya está arreglado" o "así lo tenemos documentado" de backend no reemplaza probarlo (ver
también el caso de CORS en *El backend ya está levantado*, más abajo).

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
type VacancyStatus = "PENDIENTE" | "PUBLICADO" | "FINALIZADO";
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

**Regla general: azul principal para lo importante, azul secundario para lo secundario.**
El navy de marca (`--primary`/`bg-ucu-blue`) es para lo que tiene que llamar la atención —
CTAs, focus ring. El azul secundario (`--secondary-blue`, un tono intermedio del mismo
navy — ni el navy sólido de `--primary` ni un pastel casi blanco) es para todo lo que
necesita leerse "de marca" sin pelearle protagonismo a lo importante — pills, tags,
marcadores secundarios, y también el ítem activo del Sidebar (ver el aviso más abajo).
Texto: claro (`--secondary-blue-foreground`, un blanco roto), no navy — a esta
luminosidad un texto navy oscuro ya no tiene contraste suficiente.

| Rol | Token / utilidad | Cuándo |
|---|---|---|
| **Botón de acción principal** | `bg-ucu-blue text-white hover:bg-ucu-blue/90` | El CTA de una pantalla (submit de login/registro, "Aplicar" en el detalle de vacante, etc.) — color de marca **explícito**, no el token `bg-primary`. Ver *nota* abajo. |
| Focus ring / links | `ring-ring` / `text-primary` | Sigue por el token semántico — es el mismo navy, no hace falta repetirlo a mano fuera del botón principal. |
| Acción secundaria | `bg-secondary` | Botón secundario, sin protagonismo visual (gris neutro, no de marca — no confundir con el azul secundario de abajo). |
| **Azul secundario (pills/tags)** | `bg-secondary-blue text-secondary-blue-foreground` | **Todo pill/tag de contenido**, sin excepción: skills (`skills-tab.tsx`, el detalle de vacante en `vacancy-detail-view.tsx`), área/carrera (`vacancy-feed-card.tsx`, `vacancy-feed-list-row.tsx`, `application-card.tsx`), ubicación/industria del preview de empresa (`company-profile-preview.tsx`), y el ítem activo del Sidebar/Sheet (`sidebar.tsx`, `navbar.tsx`) — mismas clases escritas literal en el sitio de uso, mismo criterio que el botón de acción principal (ver *nota* abajo). Un solo tono de azul secundario para todos los usos — no un pastel para unos y otro tono para otros. Confirmado 2026-07-23: no queda ningún pill de contenido en `bg-secondary` (gris neutro) — ese variant solo se usa hoy para badges que NO son pills de contenido (el contador de filtros activos junto al botón "Filtros", los `*StatusBadge` con punto de color). |
| Texto apagado / ayuda | `text-muted-foreground` | Descripciones, helper text, metadata. |
| Fondo sutil | `bg-muted` / `bg-accent` | Hover de filas, fondos de sección, superficies de bajo contraste. |
| Error / destructivo | `bg-destructive` / `text-destructive` | Estados de error, botones destructivos, `aria-invalid`. |
| Bordes | `border-border` (general) / `border-input` (controles de formulario) | Nunca un gris arbitrario (`border-gray-200`, etc.). |

**El botón de acción principal de una pantalla escribe el color de marca explícito:
`bg-ucu-blue text-white hover:bg-ucu-blue/90`** — no `bg-primary`. Es el mismo navy
(`--primary`/`--brand-navy` resuelven al mismo `#052E66`), pero el CTA principal no
depende del token: lo escribe literal, como ya hacían los submit de `login-form.tsx` y
`register-form.tsx` (`bg-ucu-blue text-base font-medium text-white hover:bg-ucu-blue/90`)
y ahora también el botón "Aplicar" de `vacancy-detail-view.tsx`. Confirmado 2026-07-22 después de
que un choque de cache entre `next dev` y `next build` corridos a la vez hizo que
`bg-primary` sirviera un chunk de CSS viejo (teal, de antes de esta guía) — con el color
de marca escrito a mano en el botón, no importa si el token está mal resuelto en el
momento. El resto de los usos de "primario" (focus ring, links) se quedan en el token
(`ring-ring`/`text-primary`) — la explicitud es solo para el botón de acción principal.

Los otros 2 colores de marca (`bg-ucu-orange`, `bg-ucu-teal`, y sus variantes
`text-*`/`border-*`) son para **superficies de marca explícitas** — el panel hero de
`(auth)`, ilustraciones, acentos puntuales (los puntitos de color de `AuthLayout`) — no
para pisar `bg-secondary`/`bg-muted`/etc. en cualquier lado. Ninguno de los dos tiene un
rol semántico fijo fuera de "acento": son puntuales (dots, texto destacado), nunca un
fondo grande ni un botón — sobre todo `ucu-orange`, el más saturado de los tres, que
compite con el contenido si se usa de más.

⚠️ **`ucu-teal` YA NO es el marcador del ítem activo del Sidebar** — esa fue una decisión
anterior (`--sidebar-primary`/`--sidebar-ring` en teal) que se revirtió por fea: un verde
agua sobre el navy del Sidebar desentonaba con el resto de la paleta. Ese rol lo tiene
ahora el **azul secundario**: el ítem activo escribe `bg-secondary-blue
text-secondary-blue-foreground` literal en `sidebar.tsx`/`navbar.tsx`, no
`bg-sidebar-primary` — mismo criterio (y misma razón, el choque de cache de la nota de
arriba) que el botón de acción principal. `--sidebar-primary`/`--sidebar-ring` siguen
apuntando a `--secondary-blue` en `globals.css` por si alguna librería de terceros los
lee, pero ningún componente propio depende de esa cadena. `ucu-teal` queda solo como
acento puntual, igual que `ucu-orange`.

⚠️ **`--secondary-blue` se re-tonó el 2026-07-23 — un solo valor, no dos.** Al principio
era un pastel casi blanco pensado solo para pills/tags (con texto navy encima, mismo
criterio que `--primary-foreground` con los roles invertidos). Al reusar esa misma
variable para el ítem activo del Sidebar (aviso de arriba), el pastel contrastaba
demasiado fuerte contra el navy de fondo. En vez de mantener dos azules secundarios
distintos (uno por contexto), se estandarizó a un único tono intermedio —
`oklch(0.5 0.14 258.136)`, ni pastel ni navy sólido — que funciona para los dos casos, y
se borró el valor pastel viejo. Consecuencia: `--secondary-blue-foreground` pasó de navy
oscuro a un blanco roto (`oklch(0.98 0 0)`) en los tres sitios que lo usan (badges de
área del feed/"Mis postulaciones" y el ítem activo del Sidebar/Sheet) — un cambio de
CSS variable, sin tocar componentes.

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

⚠️ **Ninguna pantalla renderiza su propio título ni bajada.** El nombre de la sección lo
muestra el Navbar ("Header dinámico + breadcrumb" más abajo — ya implementado); repetirlo
como `<h1>`/bajada en el contenido de la página quedaría duplicado. Por eso las pantallas
quedan sin título ni bajada visibles en el contenido — es a propósito, no un olvido. No se
crea un componente nuevo por pantalla o por rol (tipo `DashboardHeader`) aunque sea solo
para admin.

`PageHeader` (`components/layout/page-header.tsx`) existía como contenedor de ese header
(`title`/`description`/`actions`), pero **hoy no lo renderiza ninguna pantalla**: el título
y la bajada los da el Navbar (arriba) y la acción primaria pasó a la fila de filtros,
alineada a la derecha (**2026-07-28** — ver `company-vacancies-view.tsx` y "Barras de
filtros / toolbars" más abajo). El componente queda disponible por si alguna pantalla
vuelve a necesitar un header propio, pero sin usos actuales.

### Tamaño de controles interactivos

Los primitivos de `components/ui/` (`Button`, `Input`, `SelectTrigger`) traen por default
un tamaño compacto (`h-8`) pensado para UI densa. Conviven tres contextos con necesidades
distintas, y **los tres son correctos** — no hay que unificarlos a un solo alto:

- **Formulario de página completa** (login, registro, completar perfil: la persona
  completa el formulario y listo, nada más en pantalla): controles más grandes y
  táctiles. Estándar: **`h-11`** en `Input`/`SelectTrigger` (con `px-4 text-base`), **`h-12`**
  en el botón de submit principal. Se aplica con `className` en el sitio de uso — **no** se
  edita el default de `components/ui/` a mano (esa regla de arriba sigue aplicando).
- **Barra de filtros / tabla densa** (`vacancy-filters.tsx`, `vacancy-feed-filters.tsx`,
  `vacancy-table.tsx`): se deja el tamaño default de los primitivos (`h-8`). Es una barra de
  herramientas sobre una lista, no un formulario — la densidad ahí es una ventaja, no un
  descuido.
- **CTA primario suelto en un card de contenido** (no es un formulario ni una toolbar —
  ej. "Aplicar" en el detalle de vacante, `ApplyAction` en `vacancy-detail-view.tsx`):
  **`h-10`** con `px-6` (el default de `Button` ya trae `text-sm`, no hace falta repetirlo).
  ⚠️ Antes decía `h-12` (mismo alto que el submit de un formulario) — se bajó a `h-10`
  porque con una sola palabra ("Aplicar") el botón se veía chico/perdido dentro de una caja
  demasiado alta, un CTA suelto en un card no necesita el mismo alto táctil que el submit
  de un formulario de página completa.

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
  `Popover` + `Command` — ver `components/filters/multi-select.tsx`), con el
  trigger resumiendo la selección (`"2 seleccionadas"`). No un `Select` de valor único
  suelto en la barra. Dentro de la lista desplegable, **cada opción muestra su propio
  `Checkbox`** (visual, `pointer-events-none` — el click lo maneja el `CommandItem`) para
  que se entienda de un vistazo que se puede tildar más de una. El filtro pasa a ser un
  array (`areaIds?: string[]`, no `areaId?: string`) y el filtrado en memoria matchea por
  pertenencia (`.includes(...)`), no por igualdad.
- **La acción primaria de la pantalla (crear, publicar) va siempre arriba a la derecha, en
  la misma fila que la barra de filtros/búsqueda** — un `flex items-center justify-between
  gap-4` con los filtros a la izquierda y el botón de acción a la derecha (ver
  `company-vacancies-view.tsx`). Lo fijo son las dos posiciones —filtros a la izquierda,
  acción arriba a la derecha—, no el envoltorio: no hace falta un `PageHeader` en una fila
  aparte solo para colgar la acción. ⚠️ **Cambiado 2026-07-28**: antes esta guía pedía la
  acción en el `actions` de `PageHeader`, en una fila propia, y prohibía compartir la fila
  de los filtros — se revirtió.
- **Limpiar filtros tiene dos niveles, los dos DENTRO del popover de "Filtros"** — no se
  agrega ningún botón de limpiar suelto en la barra: el badge de conteo en "Filtros" ya
  avisa que hay algo activo, y abrir el popover es donde se decide qué.
  - **Por sección: dentro del propio dropdown de cada `MultiSelect`**, no al lado del
    `Label`. Cuando esa sección tiene algo tildado, el dropdown agrega un `CommandSeparator`
    y un `CommandItem` centrado "Limpiar" al pie de sus opciones (ver
    `components/filters/multi-select.tsx`) — limpiar esa sección es una acción del
    propio control, no de la sección que lo envuelve. `FilterSection`
    (`components/filters/filter-popover.tsx`) queda solo como el wrapper
    `Label` + control, sin lógica de limpiar.
  - **Todas: al pie del popover, debajo de la última sección** — un `Separator` y un
    `ClearLink` ("Limpiar todo") centrado, visible solo si `activeCount > 0`. Resetea
    todos los campos del popover, PERO NO búsqueda ni orden (esos no son "filtros" en este
    layout, son sus propios controles — ver el punto de arriba). No va arriba del todo ni
    al lado del título "Filtros": es la última acción de la lista, después de haber visto
    todas las secciones. **No se arma a mano en cada barra**: se usa
    `FilterPopoverContent` de `components/filters/filter-popover.tsx`, que ya incluye el
    pie de "Limpiar todo". Cada barra solo pasa `activeCount`, `onClearAll` y las
    `FilterSection` como `children`.

  ```tsx
  <FilterPopoverContent activeCount={activeCount} onClearAll={clearAll}>
    <FilterSection label="Área">
      <MultiSelect className="w-full" /* trae su propio "Limpiar" interno */ />
    </FilterSection>
    {/* ...una FilterSection por filtro... */}
  </FilterPopoverContent>
  ```

⚠️ **`components/filters/multi-select.tsx` es el único `MultiSelect` del repo.** Un PR
paralelo (#14) había agregado un `FilterMultiSelect` genérico aparte, sin consumidores;
se eliminó (`filter-multi-select.tsx` sigue sin uso, no volver a agregarlo). El pie de
"Limpiar todo" tampoco se reimplementa: siempre va por `FilterPopoverContent`.

⚠️ **Ya no existe el paradigma de "borrador" + "Aplicar filtros".** Hasta 2026-07-24,
`vacancy-filters.tsx` ("Mis ofertas" de empresa) y las tres barras de `moderacion/`
(`companies-filters.tsx`, `students-filters.tsx`, `applications-filters.tsx`) divergían
del resto: editaban un estado "borrador" y solo buscaban al presionar un botón "Aplicar
filtros" (`ApplyFiltersButton`/`ClearFiltersButton`, en `components/filters/`), con esos
dos botones sueltos al lado del popover de "Filtros". Se unificó todo a **un solo
paradigma, aplicado en vivo**, igual al que ya tenía el feed de alumno
(`vacancy-feed-filters.tsx`): cada cambio (búsqueda o `MultiSelect`) se emite de
inmediato por `onChange`, sin estado intermedio ni botón de "Aplicar". `ApplyFiltersButton`
y `ClearFiltersButton` se borraron — no quedan consumidores, no se vuelven a agregar. En
las pantallas con paginación, el `onChange` que le pasa la vista a la barra de filtros
envuelve al filtro nuevo para resetear `page: 1` (ver `updateFilters` en
`company-vacancies-view.tsx`, `admin-companies-view.tsx`, `students-view.tsx` y
`applications-view.tsx`) — el "Limpiar todo" queda igual que en el resto de la sección
(`FilterPopoverContent`, ver arriba).

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
    <FilterPopoverContent activeCount={activeCount} onClearAll={clearAll}>
      {/* Un FilterSection + <MultiSelect className="w-full" ... /> por filtro */}
    </FilterPopoverContent>
  </Popover>
</div>
```

Ver `vacancy-feed-filters.tsx` y `vacancy-filters.tsx` para el patrón ya aplicado.
El pie de "Limpiar todo" lo aporta `FilterPopoverContent` — no se repite a mano.

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

### Header dinámico + breadcrumb (✅ implementado)

> Sigue siendo zona de conflicto (los 3 grupos comparten `Navbar`): coordinar antes de
> tocar `components/layout/navbar.tsx`. Ya está implementado — este bloque documenta el
> comportamiento vigente, no una decisión pendiente.

El `Navbar` ya **no** muestra un título fijo (`"UCU Talent"` se movió al logo del Sidebar):
según el `pathname` muestra:

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

**Cómo lo alimenta una página de detalle**: el nombre del ítem lo pone la propia página
(en `features/<dominio>/`) vía `usePageBreadcrumb(label)` de
`components/layout/breadcrumb-context.tsx` — así la dependencia sigue yendo `features/` →
`components/`, nunca al revés. El `label` tiene tres estados: `undefined` mientras carga
(el Navbar muestra un `Skeleton`), `null` si resolvió sin nombre —error o no encontrado—
(el Navbar omite el ítem y deja solo la sección, sin `Skeleton` perpetuo), y el `string`
con el nombre.

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
- **El estado de aprobación vive canónicamente en `User`.** Un único
  `AccountStatus: enum(PENDIENTE, APROBADO, RECHAZADO)` para los tres roles, y **llega en
  `GET /me`**. Esto reemplaza a los dos enums separados que había antes
  (`CompanyStatus` / `StudentProfileStatus`) y también al booleano `Company.approved` del
  MER viejo. ✅ Confirmado en `docs/ENDPOINTS.md`: `StudentProfileResponse` y
  `CompanyResponse` **también** traen `status`/`reviewedAt`/`adminComment` — el mismo valor
  duplicado en el perfil, para que la pantalla de perfil no necesite un segundo fetch a
  `/user/{id}` solo para mostrarlo. La fuente de verdad sigue siendo `User.status`.
- **Toda cuenta nace `PENDIENTE`** (alumno y empresa). No hay aprobación automática: la
  vía `@ucu.edu.uy` que preveía el SRS (RF-AUT-01, RN-01) **se descartó**. Todo alumno se
  registra igual, con documento, y queda `PENDIENTE` hasta que un **Admin lo apruebe a
  mano** contra el padrón (`UniversityRegistry`) → `APROBADO` o `RECHAZADO`, vía
  `PATCH /user/{id}`. ✅ **Confirmado directo contra el código fuente del backend**
  (`UserServiceImpl.create`, rama `dev`): los dos branches de rol (`ALUMNO`/`EMPRESA`)
  setean `AccountStatus.PENDIENTE` — es efectivamente un `if`/`else` sin diferencia. Esto
  es más fuerte que "confirmado de palabra": el `ENDPOINTS.md` propio del repo de backend
  (`ucu-talent-backend/docs/ENDPOINTS.md`) dice lo contrario — "`ALUMNO` nace `APROBADO`,
  `EMPRESA` nace `PENDIENTE`" — pero esa afirmación **no coincide con su propio código**,
  así que se descarta como error de esa doc, no como cambio de comportamiento (ver la nota
  sobre las fuentes al principio de este archivo). Una vez `APROBADO`/`RECHAZADO`, el Admin
  puede alternar libremente entre esos dos (`PATCH /user/{id}` es reversible en ese sentido:
  puede pasar de `RECHAZADO` a `APROBADO` más tarde, y viceversa) — lo único que
  `UserServiceImpl.updateStatus` bloquea con `409` es volver a `PENDIENTE`.
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
- Vacante (`Vacancy`): **post-moderación (DEC-01)** — nace ya `PUBLICADO` **por default**
  al crearse, sin aprobación previa por puesto (RN-03). Estados **confirmados**:
  `enum(PENDIENTE, PUBLICADO, FINALIZADO)` — **sin `RECHAZADO`** (se descartó) **ni
  `paused`**. ✅ **Confirmado contra el código fuente del backend** (`vacancy/VacancyStatus.java`),
  con dos endpoints separados por actor: `PATCH /vacancy/status/{id}` (EMPRESA + dueña) y
  `PUT /vacancy/status/{id}` (ADMIN, `UpdateVacancyStatusAdminRequest`). Las transiciones
  NO son simétricas por rol:
  - **La empresa dueña SOLO cierra desde `PUBLICADO`** — `PUBLICADO → FINALIZADO`
    (terminal, RF-PUE-03). ⚠️ **NO puede cerrar desde `PENDIENTE`** — corrige una versión
    anterior de este párrafo (y de una nota más abajo, en *Estado actual del repo*) que
    decía que sí podía, apoyada en el `ENDPOINTS.md` del propio repo de backend. El código
    fuente real (`VacancyServiceImpl.updateVacancyStatus`, rama `dev`) lo prohíbe
    explícitamente: `if (existing.getStatus() == PENDIENTE) throw new
    ForbiddenOperationException("El Puesto está en revisión.")` — un `403`, no un `409`.
    Mientras el Admin la tiene en revisión, la empresa no puede tocarla. `vacancy-table.tsx`
    ya estaba bien (el botón "Cerrar" solo sale para `PUBLICADO`); era la doc la que estaba
    mal.
  - **El Admin SOLO mueve `PUBLICADO ↔ PENDIENTE`** — nunca a `FINALIZADO`, aunque esto es
    **política, no algo que el código fuerce**: `updateVacancyStatusAdmin` acepta cualquier
    `VacancyStatus` en el body salvo que la vacante YA esté `FINALIZADO` — no hay un chequeo
    explícito que impida mandar `status: FINALIZADO`. El front nunca ofrece esa opción en la
    UI de Admin, así que no es un problema práctico, pero no depender de que el backend lo
    vaya a rechazar solo. "Dar de baja" para el Admin es `PUBLICADO → PENDIENTE` (se
    conservan las postulaciones, no hay baja física) — eso sigue confirmado.

  Impacto: el panel de admin es una **bandeja de revisión de lo ya publicado** (últimas
  24h destacadas — RF-MOD-01), no una cola de aprobación previa ni una que pueda cerrar
  vacantes. La empresa ve su vacante viva apenas la crea.

  ⚠️ **`closingDate` es obligatoria al crear y dispara un cierre automático.** No estaba
  documentada en ninguna versión de `ENDPOINTS.md` (ni la local ni la del backend) hasta
  que se verificó contra el código fuente: `CreateVacancyRequest.closingDate` es
  `@NotNull`, y un cron diario en el backend
  (`VacancyServiceImpl.finalizeExpiredVacancies`, 00:00 America/Montevideo) pasa a
  `FINALIZADO` toda vacante `PUBLICADO` cuya `closingDate` ya pasó, y dispara el mail de
  cierre a cada postulante — sin que la empresa haga nada. `publicationDate` también es
  obligatoria al crear (no la autogenera el backend al aprobar/publicar); el back valida
  que no sea anterior a hoy, que `closingDate` no sea anterior a `publicationDate`, y que
  no pase más de un año entre las dos. El form de "Publicar oferta" (`job-basic-info-form.tsx`)
  ya pide las dos fechas.
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

**El documento del alumno son dos campos, no uno.** `documentType` es un `Select`
(`CEDULA_IDENTIDAD` / `PASAPORTE` / `DNI` — labels en español, default
`CEDULA_IDENTIDAD`) y `documentNumber` un input de texto libre. El número **se valida de
formato en el front, según el tipo elegido** (ver A-10): cédula/DNI solo dígitos, exactamente 8;
pasaporte alfanumérico 6–9. La validez real (dígito verificador, padrón) la hace el
backend — el front solo chequea superficie y **bloquea el avance** con un mensaje inline
genérico ("Ingresá un número de documento válido.") igual que la contraseña. El backend
limpia separadores (puntos, comas) antes de guardar, así que el número puede tipearse con
o sin ellos; la lógica pura vive en `lib/validators.ts`
(`cleanDocumentNumber`/`isValidDocumentNumber`), compartida por `register-form.tsx` y
`complete-profile-form.tsx` (los dos formularios montan el mismo paso 2).

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
  { userId, email, role: Role, status: AccountStatus, registeredAt, hasProfile: boolean }
  ```
  El `status` se lee fresco de la BD en cada llamada, nunca del JWT — así una aprobación
  del Admin se refleja sin reloguear. `hasProfile` ✅ ya es un campo real del wire (antes
  A-09 lo daba como "confirmado, todavía no en api-dev"; `docs/ENDPOINTS.md` lo cierra) —
  `hooks/use-session.ts` hoy lo *deriva* del 404 al perfil en vez de leerlo
  directo; no es incorrecto (mismo resultado), pero es candidato a simplificarse una vez
  que se confirme el campo en `api-dev`. Lo consume una sola vez para toda la app (Query
  deduplica por `queryKey`).
- **`MeResponse` NO trae `name`.** El navbar necesita el nombre, así que hoy hace falta un
  segundo fetch al perfil según el rol (`GET /student-profile?userId={id}` o
  `GET /company?userId={id}`). Está pedido como cambio a backend — ver *Pendiente de
  aclarar*.
- **PK compartida**: `studentProfileId === userId` y `companyId === userId`. No hace falta
  guardar un id de perfil aparte ni resolverlo con una llamada extra.
- `lib/api-client.ts` manda `credentials: "include"` para que el browser adjunte la cookie
  en cross-origin.

⚠️ **`POST /auth/login` tiene rate limit — no documentado en ninguna versión de
`ENDPOINTS.md`, verificado contra el código fuente del backend.** Doble límite en memoria:
5 intentos/60s por email, 20 intentos/60s por IP. Al excederse devuelve `429 Too Many
Requests` (`application/problem+json`, header `Retry-After` con los segundos de bloqueo) y
escala progresivamente si la misma key reincide (30s → 3min → 15min, se resetea solo tras
24h sin infracciones). `login-form.tsx` hoy no distingue `429` de otros errores — si
`api-client.ts` ya expone bien el `detail`/`Retry-After` (ver A-19), es un buen próximo paso
mostrar el tiempo de espera en vez del mensaje genérico de error de login.

### Postulaciones: máquina de estados

```
VacancyApplicationStatus: enum(PENDIENTE, VISTO, FINALIZADO)
```

⚠️ **El valor terminal es `FINALIZADO` (masculino), NO `FINALIZADA`.** Varias versiones
anteriores de este archivo (y de `types/index.ts`) insistían en que era femenino "por
postulación", justo para no confundirlo con `VacancyStatus.FINALIZADO` — esa distinción
**no existe en el wire real**: verificado directo contra el enum fuente del backend
(`vacancyapplication/VacancyApplicationStatus.java`), los dos enums usan la misma palabra.
Si algo en el código sigue comparando contra `"FINALIZADA"`, está mal.

| Transición | Disparador | Actor |
|---|---|---|
| (alta) → `PENDIENTE` | el alumno se postula | Alumno |
| `PENDIENTE` → `VISTO` | la empresa abre el perfil del postulante | Empresa dueña |
| `VISTO` → `FINALIZADO` | acción explícita de la empresa (`PUT /vacancy-application/{id}`) | Empresa dueña |

⚠️ **La última transición NO es automática — corrige una versión anterior de esta
tabla**, que decía "automático, en cascada al finalizar el puesto, Sistema". Verificado
contra el código fuente (`VacancyApplicationServiceImpl`/`VacancyServiceImpl`/
`VacancyFinalizationNotifier`): cerrar una vacante (por la empresa, o por el cron de
`closingDate` — ver *Roles y control de acceso*) **solo dispara el mail de cierre a cada
postulante**, nunca toca `VacancyApplication.status`. La única función que cambia el
status de una postulación es `VacancyApplicationServiceImpl.update`, llamada
exclusivamente desde `PUT /vacancy-application/{id}` (empresa dueña, acción explícita) —
no hay ningún otro caller. El frontend todavía no tiene una acción de UI para disparar
`VISTO → FINALIZADO` (ver `use-mark-applicant-viewed.ts`, que solo cubre
`PENDIENTE → VISTO`).

- El estado **nunca retrocede** (RN-08). Una transición inválida devuelve `409` y no
  modifica la postulación.
- Un alumno no puede postularse dos veces al mismo puesto: `UNIQUE (vacancy_id,
  student_profile_id)` (RN-05). El segundo intento devuelve `409`.
- **El alumno puede retirar su propia postulación**: `DELETE /vacancy-application/{id}`
  (dueño = el alumno postulante, verificado contra `VacancyApplicationController.delete`).
  No documentado en ninguna versión de `ENDPOINTS.md`; sin UI en el front todavía.
- **Postularse exige que el alumno tenga al menos un registro de `Education`** — resuelve
  A-07 (antes "el backend no lo valida, decisión de front"): sí lo valida, `409` con el
  mensaje "El alumno debe tener al menos un registro de educacion para postularse" si no
  tiene ninguno (`VacancyApplicationServiceImpl.create`). El front no lo pre-valida — el
  mensaje de error real del backend ya lo explica (ver `use-vacancy.ts`).
- **También hace falta que la vacante esté `PUBLICADO`**: postular a una `PENDIENTE`
  devuelve `409` ("Solo se puede postular a vacantes en estado PUBLICADO"). `ApplyAction`
  (`vacancy-detail-view.tsx`) ya bloquea el botón en ese caso.

⚠️ **`accepted` volvió — reversión de una reversión.** El MER aprobado tenía `selected`
(`Vacancy_Application.selected: boolean`, DEC-06); una revisión anterior de esta sección
lo daba por eliminado porque ninguna versión de `docs/ENDPOINTS.md` (ni la local ni la del
backend) lo documentaba. **Verificado contra el código fuente del backend, no contra esa
doc**: el campo existe, se llama `accepted` (no `selected`) y vive en
`VacancyApplicationResponse` — boolean, default `false`, de solo lectura salvo por
`PATCH /vacancy-application/{id}/accept` (empresa dueña, sin operación inversa). Define el
contenido del mail de cierre (`VacancyFinalizationNotifier`: `accepted === true` →
`sendVacancySelectedEmail`, si no → `sendVacancyClosedEmail`) — es decir, el criterio que
esta sección daba como "no definido en `docs/ENDPOINTS.md`" sí está definido, solo que en
el código, no en ese doc. **Sigue sin viajar en `VacancyApplicationStudentResponse`**
(`GET /vacancy-application/me`) — el alumno sigue sin poder ver si quedó seleccionado; la
barra de progreso de "Mis postulaciones"
(`features/postulaciones/components/application-progress.tsx`) sigue sin mostrarlo, y eso
sí sigue siendo correcto. `types/index.ts` (`VacancyApplication.accepted`) ya lo tiene.

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
   sistema manda un no-reply por postulante. `result_notified_at` da idempotencia. El MER
   originalmente ataba el contenido del mail a `selected`, pero ese campo se eliminó del
   contrato cerrado (ver *Postulaciones*) — el criterio real para el contenido del mail
   no está definido en `docs/ENDPOINTS.md` hoy.

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
│                           #    sesión (use-session, use-current-company, use-logout).
│                           #    NO van en lib/ (sin React) ni en components/. Un hook de
│                           #    UN solo dominio va en features/<x>/hooks/
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
  `use-logout.ts`). No es un cajón para cualquier hook: si un hook es de un solo dominio,
  va en `features/<x>/hooks/`. Solo sube acá lo que lo consumen **varios dominios o
  `components/`** y no tiene otro hogar legal — es lo que evita tanto el import cruzado
  `features/A → features/B` como el `components/ → features/` (ese fue el caso de
  `use-logout.ts`: lo consumen `navbar`/`sidebar`, que no pueden importar de `features/`).
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
  `VacancyStatus: enum(PENDIENTE, PUBLICADO, FINALIZADO)`,
  `ContractType: enum(FULL_TIME, PART_TIME, FREELANCE, PASANTIA, CONTRATO_FIJO,
  CONTRATO_INDEFINIDO, SUPLENCIA, BECA)`, `Vacancy`,
  `VacancyApplicationStatus: enum(PENDIENTE, VISTO, FINALIZADO)`, `VacancyApplication`
  (con `accepted` — ver *Postulaciones*), `Paginated<T>`.
- **`features/<x>/types.ts` → lo específico del dominio**: filtros, payloads de formulario,
  view models. No cruzan a otro dominio, así que no suben.

> **Cambios respecto de la versión anterior de esta lista**, por si hay código escrito
> contra ella:
> - `CompanyStatus` y `StudentProfileStatus` → **se unifican en `AccountStatus`**, que
>   vive en `User` y llega en `GET /me`.
> - `VacancyApplicationStatus` deja de tener `ACEPTADO`/`RECHAZADO` → es
>   `PENDIENTE, VISTO, FINALIZADO` (masculino, no `FINALIZADA` — corregido tras verificar
>   contra el enum fuente del backend). El flag de resultado sí existe: se llama `accepted`,
>   no `selected` — ver *Postulaciones*.
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
  `components/`, `lib/`, `types/` o `hooks/` (este último para hooks app-wide que
  dependen de React — la capa de sesión, ver *Estructura de carpetas*). Sin excepciones
  "salvo auth": la sesión ya NO vive en `features/auth`, vive en `hooks/`.
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
| `puestos` | feed, ver detalle | crear/editar/cerrar | moderar (dar de baja a revisión) |
| `postulaciones` | postularse, ver estado | postulantes: marcar `VISTO` | — |
| `perfil` | dueño | ve perfiles de postulantes | — |
| `moderacion` | — | — | dueño |

`features/puestos/` lo tocan los tres grupos. Por eso las **entidades core y los enums se
acordaron antes de repartir**: si cada grupo definía su propio `Puesto`, en una semana
había tres tipos incompatibles.

### Zona de conflicto — coordinar antes de tocar

- `types/index.ts` — las entidades core; las usan los 3 grupos.
- `components/layout/` — sobre todo `nav-items.ts` (fuente única del nav por rol).
- `lib/` — `api-client.ts`, `auth.ts`.
- `app/layout.tsx`, `app/providers.tsx` y los 5 `layout.tsx` de route group (incluido el
  de `(perfil)`, compartido entre alumno y empresa) — son del equipo, no del grupo del rol
  correspondiente. Tocar los defaults del `QueryClient` afecta a los tres grupos a la vez.
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
- `layout.tsx` de los 5 route groups, con `RoleGuard` / `GuestOnly`.
- `app/providers.tsx`: `QueryClient` con los defaults de TanStack Query.
- `types/index.ts` y los 5 `features/<x>/types.ts`.
- `lib/api-client.ts`: la **forma** del cliente (verbos, `ApiError`, base URL). Faltan los
  endpoints, pero **el contrato ya existe**: `docs/ENDPOINTS.md` (recibido 2026-07-27,
  marcado "contrato funcional cerrado" — es la fuente #3 de la tabla de precedencia del
  encabezado de este archivo).
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
  `puestos` (`use-company-vacancies.ts`, todavía sobre fixtures). Ya se pueden escribir
  contra `ENDPOINTS.md`. `hooks/use-session.ts` (capa de sesión app-wide, en el bucket
  `hooks/` de raíz — ver *Estructura de carpetas*) sirve de plantilla del patrón.
- ✅ **`app/(empresa)/puestos/page.tsx`** — ya existe ("Mis ofertas"), construida por el
  grupo de empresa. Ver `VacancyStatus` en *Roles y control de acceso*: el enum es
  `PENDIENTE, PUBLICADO, FINALIZADO` (default `PUBLICADO`, A-14 ✅). **Ya NO colapsa
  estados** — corrige una versión anterior de esta nota, escrita cuando `api-dev` todavía
  exponía solo `PENDIENTE, FINALIZADO`: `vacancy-table.tsx` hoy pinta los tres estados
  distintos vía `VacancyStatusBadge` + `VACANCY_STATUS_DESCRIPTION`, y la acción "Cerrar"
  sale solo para `PUBLICADO`. ⚠️ Eso último es **correcto, no un gap** — corrige un aviso
  de una revisión anterior de esta misma nota, que decía lo contrario apoyándose en el
  `ENDPOINTS.md` del propio repo de backend (no en su código): `VacancyServiceImpl.
  updateVacancyStatus` (fuente real del backend, verificado en `dev`) **prohíbe
  explícitamente** que la empresa cierre desde `PENDIENTE` (`403 "El Puesto está en
  revisión."`) — solo puede cerrar desde `PUBLICADO`. El código de `vacancy-table.tsx` ya
  estaba bien; era la nota la que estaba mal. "Cerrar" sigue siendo un stub
  (`notImplemented(...)`), sin mutación real todavía — eso sí sigue pendiente.
- Las `page.tsx` de `/feed`, `/postulaciones` y `/puestos/[id]/postulantes` siguen siendo
  placeholders.
- ✅ **`/perfil` es una ruta COMPARTIDA entre alumno y empresa** (route group `(perfil)`,
  guardado ALUMNO+EMPRESA): la `page.tsx` ramifica por rol y monta `CompanyProfileView`
  (empresa, ya construida — `features/perfil/`) o `StudentProfileView` (alumno, todavía
  placeholder). Reemplazó a `(alumno)/perfil` y `(empresa)/perfil-empresa`, que ya no
  existen. Ver el porqué del group propio en *Estructura de carpetas*.

### El backend ya está levantado

**`https://api-dev.ucutalent.tech/`** — entorno de desarrollo, en pie.
Swagger UI: `https://api-dev.ucutalent.tech/swagger-ui/index.html` (el `/v3/api-docs`
crudo pide sesión).

```bash
cp .env.example .env.local
NEXT_PUBLIC_API_BASE_URL=https://api-dev.ucutalent.tech
```

⚠️ **La cookie cross-origin sigue siendo el punto a terminar de cerrar — y hoy hay DOS
orígenes de frontend, no uno.** Además de `http://localhost:3000` (local), el frontend
también está deployado en **`https://dev.ucutalent.tech/`** — dominios distintos de la
API (`https://api-dev.ucutalent.tech`) en los dos casos. Por eso, desde 2026-07-28, probar
un cambio ya no alcanza con local: hay que verificarlo **también** contra
`https://dev.ucutalent.tech/`. Para que el browser acepte y reenvíe la cookie de sesión
hacen falta **las dos puntas**:

- Backend: `Set-Cookie` con `SameSite=None; Secure`, y CORS con
  `Access-Control-Allow-Credentials: true` + `Allow-Origin` explícito
  **para cada origen que necesite acceso** (con credenciales, `*` no sirve).
- Front: `credentials: "include"` — eso ya lo hace `lib/api-client.ts`.

Si el login "funciona" pero `GET /me` devuelve 401 en la llamada siguiente, es esto y no
otra cosa. Ver `A-13`.

✅ **CORS de `https://dev.ucutalent.tech` resuelto (confirmado 2026-07-28, ~20:26 ART).**
Estuvo roto varias horas ese mismo día — `curl` devolvía `403 Invalid CORS request` para
ese origen en cualquier endpoint, incluso `GET` simples como `GET /area` (así se detectó:
QA no podía postularse a una vacante porque nada andaba desde ese dominio, no solo esa
acción puntual). Infra avisó el fix y se volvió a probar con `curl`: preflight `OPTIONS`
ahora da `200` + `Access-Control-Allow-Origin: https://dev.ucutalent.tech`, y `GET /area`
pasa el CORS y llega hasta auth (`401` esperado sin cookie, con `detail` bien formado en
`application/problem+json`). Sigue abierto lo que ya estaba abierto en A-13 antes de esto:
confirmar los atributos del `Set-Cookie` (`SameSite=None; Secure`) con un login real desde
`https://dev.ucutalent.tech` — eso todavía no se probó.

### Modo mock (en retirada)

Sigue existiendo mientras la cookie cross-origin no ande:

```bash
NEXT_PUBLIC_MOCK_SESSION=ALUMNO   # o EMPRESA | ADMIN
```

Saltea el `GET /me` y devuelve un usuario de `lib/fixtures.ts`. **No es seguridad**: solo
cambia lo que el frontend *cree* que sos, el backend no lo mira.

**Ahora que la API existe, esto es deuda con fecha de vencimiento.** Apenas el login real
funcione contra `api-dev`, se borran `lib/fixtures.ts`, `NEXT_PUBLIC_MOCK_SESSION` y sus
usos en `lib/auth.ts` y `hooks/use-logout.ts`.

✅ **La migración a `Role: ALUMNO|EMPRESA|ADMIN` ya se hizo** en `lib/auth.ts`,
`lib/fixtures.ts` y `.env.example` (ver *Idioma del código*) — ya no queda código usando
los literales viejos (`student`/`company`/`admin`).

## Pendiente de aclarar / estado de definición

> **Actualizado 2026-07-27** contra `docs/ENDPOINTS.md` — el contrato funcional cerrado
> recibido de backend, transcripto en ese archivo. Reemplaza como fuente a las
> confirmaciones sueltas que citaba esta sección antes de que el documento existiera.
> Leyenda:
> - **✅ Resuelto** — definido y verificable hoy; se programa contra esto.
> - **🔄 Confirmado, aún no en `api-dev`** — el backend confirmó la decisión pero
>   `ENDPOINTS.md`/`api-dev` todavía no la reflejan. **Se trata como el contrato vigente
>   (se programa contra ella), pero se verifica al integrar** — no asumir que `api-dev` ya
>   lo tiene.
> - **🔴 / 🟡 Abierto** — sigue sin definirse. Si una tarea depende de uno, se frena y se
>   pregunta.

### ✅ Resuelto o confirmado (contrato vigente)

| # | Estado | Qué aplica |
|---|---|---|
| **A-01** | ✅ | **Confirmado directo contra el código fuente del backend** (`UserServiceImpl.create`, no contra prosa): el alumno nace `PENDIENTE` (igual que la empresa). Hace todo lo normal (perfil, feed, detalle) **excepto postularse**; un **Admin lo aprueba a mano** contra el padrón (`UniversityRegistry`) → `APROBADO` o `RECHAZADO`, vía `PATCH /user/{id}`. Solo `APROBADO` puede postularse. Implica que el admin construye la **cola de aprobación de alumnos** (RF-MOD-05/06). El RBAC de arriba queda **correcto**. Ver *Roles y control de acceso* para el aviso sobre por qué esto contradice al `ENDPOINTS.md` del propio repo de backend (esa doc está mal, no el comportamiento). |
| **A-02** | ✅ | Moderación **existe**: `PATCH /user/{id}` (status + `adminComment`, se guarda en `StudentProfile`/`Company`), `PUT /vacancy/status/{id}` (admin), `reviewedAt`, y `*/status-summary`. El dominio `moderacion` ya puede escribir hooks. |
| **A-03** | ✅ | `skills` es `string[]` (solo en `StudentProfile`). El orden por coincidencia (RF-FEED-01) **se descarta** — `Vacancy` no lleva `skills`. |
| **A-04** | ✅ | **`GET /vacancy` (el que usa hoy el feed) NO se pagina, y no va a hacerlo** — `docs/ENDPOINTS.md` es explícito (secciones 1 y 5): devuelve la colección completa sin paginación de servidor. Front resuelve filtro, orden y paginación visual enteramente en memoria — ya implementado así en `use-feed-vacancies.ts`. ⚠️ **Matiz nuevo, verificado contra el código fuente del backend**: SÍ existe paginación real de servidor, pero en un endpoint DISTINTO que el front todavía no usa — `GET /vacancy/search` (ADMIN) y `GET /vacancy/student/search` (autenticado, ya filtra por `PUBLICADO`), los dos devuelven `Page<VacancyResponse>` con filtros combinables (área con subáreas, carrera, tipo de contrato, modalidad, localidad, keyword) y orden (`sortBy`/`sortDirection`). Ninguna versión de `ENDPOINTS.md` (ni la local ni la del backend) lo documenta. Migrar el feed a `/vacancy/student/search` reemplazaría buena parte del filtrado/paginado en memoria de A-05 — es una mejora real disponible, pero no se adoptó en esta pasada (cambia toda la capa de fetching del feed, alcance para otra tarea). `Paginated<T>` (`types/index.ts`) sigue existiendo como view model **in-memory del front** para las pantallas que ya lo simulan (tablas de postulantes, moderación, "Mis ofertas") — no está atado a ninguno de los dos casos de arriba. |
| **A-05** | ✅ | El **filtrado del feed queda en el front** por ahora (fetch-all + en memoria, ver *Barras de filtros*). ⚠️ Ya no es del todo cierto que no hay "endpoint de filtros del backend" — ver el matiz de A-04, `GET /vacancy/student/search` sí filtra combinado del lado del servidor. Se documenta acá igual porque el front no lo adoptó todavía. |
| **A-08** | ✅ | `PUT /student-profile/{id}` existe (dueño): edita `phoneNumber`, `linkedinUrl`, `skills`, `description`. `name`/`surname`/documento **no** se editan por ahí. |
| **A-09** | ✅ | `hasProfile: boolean` confirmado en `MeResponse` (`docs/ENDPOINTS.md`). `use-session.ts` hoy lo deriva del `404` del perfil — sigue siendo correcto, es candidato a simplificarse leyendo el campo directo. `name` **no** se agrega — el navbar sigue con el 2º fetch al perfil, es el diseño definitivo. |
| **A-10** | ✅ | Documento **único por el par `(documentType, documentNumber)`**. La **validez** del documento (dígito verificador, etc.) la valida el **backend**; el front solo valida superficie (cantidad y tipo de caracteres). **Implementado**: `lib/validators.ts` (`isValidDocumentNumber`) — cédula/DNI solo dígitos, exactamente 8; pasaporte alfanumérico 6–9, limpiando puntos/comas/guiones/espacios antes de medir. Lo consumen los dos formularios del paso 2 (`register-form.tsx`, `complete-profile-form.tsx`), que muestran el tipo como `Select` y bloquean el avance con mensaje inline. |
| **A-12** | 🔄 | Gaps de autorización **corregidos en backend** — falta actualizar `api-dev`. Asumir ownership/roles aplicados. |
| **A-14** | ✅ | `VacancyStatus = PENDIENTE, PUBLICADO, FINALIZADO`, default **`PUBLICADO`** (post-moderación). **Sin `RECHAZADO`.** Dos endpoints separados por actor: `PATCH /vacancy/status/{id}` (EMPRESA + dueña, cierre) y `PUT /vacancy/status/{id}` (ADMIN, `PUBLICADO ↔ PENDIENTE`). **El Admin NUNCA llega a `FINALIZADO`** — "dar de baja" para el Admin es `PUBLICADO → PENDIENTE`, corrigiendo lo que decía una versión anterior de esta fila. Ver *Roles y control de acceso*. |
| **A-15** | ✅ | **`contractType` es un enum real**, no `string` libre — corrige lo que decía esta fila antes (que el contrato no lo confirmaba): `vacancy/ContractType.java` en el backend define `FULL_TIME, PART_TIME, FREELANCE, PASANTIA, CONTRATO_FIJO, CONTRATO_INDEFINIDO, SUPLENCIA, BECA`. Verificado contra el código fuente, no contra ningún `ENDPOINTS.md` (ninguna versión, ni la local ni la del backend, lo documentaba como enum). `types/index.ts` ya tiene `ContractType`, y el form de "Publicar oferta" ya usa un `Select` en vez de texto libre. ⚠️ **El campo de sueldo tiene un nombre DISTINTO según el endpoint** — no es indecisión de esta fila, es una inconsistencia real del backend entre sus dos DTOs: `CreateVacancyRequest.salary` (`POST /vacancy`) vs. `UpdateVacancyRequest.salaryRange` (`PUT /vacancy/{id}`). `VacancyInput` (`features/puestos/types.ts`) ya lo resuelve mandando el campo que corresponde a cada uno. `location` sigue como campo requerido en `CreateVacancyRequest` — el contrato no confirma la nulabilidad condicional a `REMOTO` que se anticipaba acá; tratar como no resuelto. Sin orden por skills. Ver también el aviso de `publicationDate`/`closingDate` (obligatorias, no autogeneradas) en *Roles y control de acceso*. |
| **A-17** | ✅ | **Reversión de una reversión — `accepted` (ex-`selected`) SÍ existe.** Una versión anterior de esta fila lo daba por eliminado porque ninguna versión de `ENDPOINTS.md` lo documentaba; verificado contra el código fuente del backend (no contra esa doc): `VacancyApplicationResponse.accepted` (boolean) es real, se marca vía `PATCH /vacancy-application/{id}/accept` (empresa dueña) y define el contenido del mail de cierre. `types/index.ts` (`VacancyApplication.accepted`) ya lo tiene. Sigue sin viajar en `VacancyApplicationStudentResponse` (`GET /vacancy-application/me`) — el alumno sigue sin verlo, la barra de progreso de "Mis postulaciones" sigue sin mostrarlo, y eso sigue siendo correcto. Ver *Postulaciones*. |
| **A-18** | ✅ | `CompanyResponse` expone `status`, `reviewedAt`, `adminComment` (y `StudentProfileResponse` también, más `description` — ver *Roles y control de acceso*). El admin ve/filtra por estado. |
| **A-19** | ✅ | Error `application/problem+json` con mapa por campo bajo la key **`errores`**: `{ detail, title, status, instance, errores: { campo: mensaje } }`. Mapear `errores` a `setError` de RHF y tipar así `ApiError`. Implementado en `lib/api-client.ts` (`errorMessage` lee `detail`, `ApiError.fieldErrors` expone `errores` — sin consumidores todavía en los formularios). |
| **A-06** | ✅ | **Resuelto: NO es una decisión de front — el backend bloquea la edición entera.** Corrige lo que decía esta fila antes ("el backend no bloquea"). `VacancyServiceImpl.updateVacancy` (fuente del backend): si la vacante tiene aunque sea una postulación (`vacancyApplicationRepository.existsByVacancyId(id)`), `PUT /vacancy/{id}` devuelve `403 "El Puesto ya tiene postulaciones."` — no hay edición parcial de "solo estos campos siguen editables", es todo o nada. También bloquea si la vacante ya está `FINALIZADO`. |
| **A-07** | ✅ | **Resuelto: SÍ, el backend lo exige.** Corrige lo que decía esta fila antes ("el backend no lo valida, decisión de front"). `VacancyApplicationServiceImpl.create` devuelve `409` ("El alumno debe tener al menos un registro de educacion para postularse") si `EducationService.getByStudentProfileId` viene vacío. El front no lo pre-valida — se apoya en que `use-vacancy.ts` ahora muestra el `detail` real del backend en vez de un mensaje genérico (ver *Postulaciones*). |
| **A-13** | ✅ | **CORS.** Confirmado OK para `http://localhost:3000` desde el principio. `https://dev.ucutalent.tech` (el frontend deployado) estuvo unas horas fuera de la whitelist el 2026-07-28 (`403 Invalid CORS request` hasta en `GET` simples) — infra lo arregló ese mismo día, reconfirmado con `curl` ~20:26 ART: preflight da `200` + `Allow-Origin` correcto, y `GET /area` pasa el CORS y llega a auth. Lo que queda de esta fila **no es CORS**: confirmar los atributos del `Set-Cookie` (`SameSite=None; Secure`) con un login real — no probado todavía. |

### 🔴 Todavía abierto

| # | Qué falta |
|---|---|
| **A-11** | **Subida de archivos** — **queda confirmar** el mecanismo (multipart vs. URL prefirmada) y los límites. Sin endpoint todavía. |
| **A-16** | **Nombre de la cookie de sesión** — se confirma leyendo el `Set-Cookie` de un login (necesario para `proxy.ts`). Requiere el login real desde `https://dev.ucutalent.tech` que quedó pendiente en A-13. |
| **A-20** | **Semilla de `Area`/`Degree` en `api-dev`** — se confirma con `GET /area`/`GET /degree` logueado. |

No quedan ítems en "🟡 Definiciones de UI (sin bloqueo de backend)" — los dos que había (A-06, A-07)
se resolvieron contra el código fuente del backend, ver la tabla de arriba.

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
- **`VacancyApplicationStatus` con `ACEPTADO`/`RECHAZADO`** — es `PENDIENTE, VISTO, FINALIZADO`.
  El flag de resultado sí existe (se llama `accepted`, no `selected` — ver *Postulaciones*),
  pero no es un tercer valor del enum de estado: es un campo booleano aparte.

Los correos automáticos son **dos** y los manda el backend: aviso de nueva postulación a
la empresa, y aviso de cierre a cada postulante al finalizar el puesto. El frontend no
manda ninguno. Ningún otro evento dispara un envío.
