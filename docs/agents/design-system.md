# Guía de estilo de componentes (UI)

> Parte de [AGENTS.md](../../AGENTS.md) — ver el índice ahí para el resto de los documentos.

> Objetivo: que un componente nuevo (lo arme una persona o la IA) se vea como si lo
> hubiera hecho el mismo equipo que hizo el resto. Esto documenta lo que **ya existe** en
> `app/globals.css` y `components/ui/` — no inventa un sistema de diseño paralelo. Ante la
> duda entre "lo que dice acá" y "lo que ya hace un componente de `components/ui/`", gana
> el componente: esta guía se corrige, no se la fuerza.

## Colores

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

## Tipografía

Una sola familia, **Inter**, vía `--font-sans` (la trae el layout raíz,
`app/layout.tsx`). `font-heading` hoy apunta a la misma variable — no hay una tipografía
de títulos distinta todavía; si se agrega una, el punto de cambio es esa variable en
`app/globals.css`, no cada componente.

| Uso | Clases | Ejemplo real |
|---|---|---|
| Título de página | `text-2xl font-semibold tracking-tight` | `h1` del Navbar (header dinámico) |
| Bajada de página | `text-sm text-muted-foreground` | — (no hay bajada de página hoy; ninguna pantalla la usa) |
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

⛔ **`PageHeader` (`components/layout/page-header.tsx`) se borró (2026-07-30).** Existía
como contenedor de ese header (`title`/`description`/`actions`) "por si alguna pantalla
volvía a necesitarlo", pero nunca tuvo un uso real: el título y la bajada los da el Navbar
(arriba) y la acción primaria pasó a la fila de filtros, alineada a la derecha
(**2026-07-28** — ver "Barras de filtros / toolbars" más abajo). Sus únicas referencias en
el repo eran comentarios explicando por qué NO se usaba — código muerto, no un componente
disponible. Si en el futuro una pantalla necesita un header propio, se arma en el momento;
no se resucita este archivo.

## Tamaño de controles interactivos

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

## Barras de filtros / toolbars

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
  acción arriba a la derecha—, no el envoltorio: no hace falta un header propio en una fila
  aparte solo para colgar la acción. ⚠️ **Cambiado 2026-07-28**: antes esta guía pedía la
  acción en el `actions` de `PageHeader` (borrado — ver "Tipografía" arriba), en una fila
  propia, y prohibía compartir la fila de los filtros — se revirtió.
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

## Espaciado

No hay tokens de espaciado propios: se usa la escala default de Tailwind
(`gap-1`, `gap-2`, `gap-3`...) de forma consistente por nivel:

| Nivel | Clase | Dónde |
|---|---|---|
| Página → header | `mb-6` | Separación entre la fila de filtros/acciones y el contenido de la página. |
| Contenedor de página | `p-4 md:p-6` | `<main>` de `AppShell` — el padding de toda pantalla autenticada. |
| Entre secciones de una página | `gap-6` | Bloques grandes dentro de una pantalla (ver `VacancyFeedView`). |
| Grillas de cards | `gap-4` | `grid` de resultados (feed, tablas en tarjetas). |
| Barra de filtros / toolbar | `gap-2` a `gap-3` | Entre controles de una misma fila de filtros. |
| Dentro de un `Card` | `--card-spacing` (`--spacing(4)`, o `--spacing(3)` con `size="sm"`) | No pisar el padding del `Card` a mano — usar la prop `size`. |
| Entre campos de un formulario | `FieldGroup` (`gap-5`) / `Field` (`gap-2` label↔control) | Usar `Field`/`FieldGroup` de `components/ui/field`, no `space-y-*` a mano. |

## Bordes y radios

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

## Header dinámico + breadcrumb (✅ implementado)

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

## Estados de los componentes

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
