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
ApplicationStatus: enum(PENDIENTE, VISTO, FINALIZADO)
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
  `ApplicationStatus: enum(PENDIENTE, VISTO, FINALIZADO)`, `VacancyApplication` (con
  `selected: boolean`), `Paginated<T>`.
- **`features/<x>/types.ts` → lo específico del dominio**: filtros, payloads de formulario,
  view models. No cruzan a otro dominio, así que no suben.

> **Cambios respecto de la versión anterior de esta lista**, por si hay código escrito
> contra ella:
> - `CompanyStatus` y `StudentProfileStatus` → **se unifican en `AccountStatus`**, que
>   vive en `User` y llega en `GET /me`.
> - `ApplicationStatus` deja de tener `ACEPTADO`/`RECHAZADO` → es
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

**Todavía NO existe:**

- **`proxy.ts`** — no hay ninguna primera línea de defensa. Va en rama `feature/`, no
  `chore/`: es funcionalidad.
- **`ProfileGuard`** (`features/perfil/components/`) y la ruta **`app/completar-perfil/`**
  — ver *Registro en dos pasos*. Hasta que existan, una cuenta sin perfil rompe las
  pantallas de `(alumno)` y `(empresa)`.
- **`features/<x>/hooks/`** — vacíos salvo `auth`. Ya se pueden escribir contra
  `ENDPOINTS.md`. `features/auth/hooks/use-session.ts` sirve de plantilla del patrón.
- **Los endpoints en `lib/api-client.ts`** — el contrato ya está, falta cablearlo.
- **`app/(empresa)/puestos/page.tsx`** — la ruta `/puestos` está en el nav pero no existe;
  la crea el grupo de empresa.
- Las `page.tsx` de cada ruta siguen siendo placeholders.

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
NEXT_PUBLIC_MOCK_SESSION=student   # o company | admin
```

Saltea el `GET /me` y devuelve un usuario de `lib/fixtures.ts`. **No es seguridad**: solo
cambia lo que el frontend *cree* que sos, el backend no lo mira.

**Ahora que la API existe, esto es deuda con fecha de vencimiento.** Apenas el login real
funcione contra `api-dev`, se borran `lib/fixtures.ts`, `NEXT_PUBLIC_MOCK_SESSION` y sus
usos en `lib/auth.ts` y `features/auth/hooks/use-logout.ts`.

⚠️ Los valores siguen siendo `student|company|admin` porque el código todavía no migró al
enum nuevo. Cuando `Role` pase a `ALUMNO|EMPRESA|ADMIN` (ver *Idioma del código*), hay que
actualizar `lib/auth.ts`, `lib/fixtures.ts` y `.env.example` en la misma tanda — son tres
archivos de la zona de conflicto, así que va en una rama propia y coordinada. Si el mock
se borra antes de esa migración, el problema desaparece solo.

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
- **`ApplicationStatus` con `ACEPTADO`/`RECHAZADO`** — es `PENDIENTE, VISTO, FINALIZADO`
  más el flag `selected`.

Los correos automáticos son **dos** y los manda el backend: aviso de nueva postulación a
la empresa, y aviso de cierre a cada postulante según su `selected`. El frontend no manda
ninguno. Ningún otro evento dispara un envío.
