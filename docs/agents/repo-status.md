# Estado actual del repo

> Parte de [AGENTS.md](../../AGENTS.md) — ver el índice ahí para el resto de los documentos.

La base compartida **ya está construida** (rama `chore/project-setup`), pensada para que
los 3 grupos puedan trabajar en paralelo sin pisarse.

**Ya existe:**

- `components/ui/`: 16 componentes sobre Radix + tema del preset, incluido `field`
  (el reemplazo de `form`).
- `components/layout/`: `AppShell`, `Navbar`, `Sidebar`, `EmptyState`, `nav-items.ts`.
  Responsive, verificado en mobile y desktop. (`PageHeader` existió acá — borrado
  2026-07-30 por no tener uso real, ver [Guía de estilo de componentes](design-system.md)
  — "Tipografía".)
- `layout.tsx` de los 5 route groups, con `RoleGuard` / `GuestOnly`.
- `app/providers.tsx`: `QueryClient` con los defaults de TanStack Query.
- `types/index.ts` y los 5 `features/<x>/types.ts`.
- `lib/api-client.ts`: la **forma** del cliente (verbos, `ApiError`, base URL). Faltan los
  endpoints, pero **el contrato ya existe**: `docs/ENDPOINTS.md` (recibido 2026-07-27,
  marcado "contrato funcional cerrado" — es la fuente #3 de la tabla de precedencia de
  [Las tres fuentes y su orden de precedencia](sources-and-precedence.md)).
- `lib/auth.ts` + `features/auth/`: sesión vía `GET /me` (`hooks/use-session.ts`) y
  guards de rol (`components/role-guard.tsx`, `components/guest-only.tsx`).
- `.env.example`.
- ✅ **`ProfileGuard`** (`features/perfil/components/ProfileGuard.tsx`) y la ruta
  **`app/completar-perfil/page.tsx`** — ver [Roles y control de acceso](roles-and-access-control.md)
  ("Registro en dos pasos y ProfileGuard"). Montado en `(alumno)/layout.tsx` y
  `(empresa)/layout.tsx`, adentro de `RoleGuard`.
- ✅ **El registro real, en 3 llamadas encadenadas** (`use-register.ts`):
  `POST /user` → `POST /auth/login` → `POST /student-profile`/`POST /company`. El
  perfil pide los campos mínimos `@NotBlank` de `docs/ENDPOINTS.md` en el mismo
  formulario de `/registro` (un solo paso visual, sin navegación entre medio).
  `features/perfil/hooks/use-complete-profile.ts` reintenta solo el paso 3 desde
  `/completar-perfil`.

**⚠️ 2026-07-30: esta lista quedó desactualizada durante un tiempo** (escrita cuando
todavía se maquetaban las pantallas sin backend) y llegó a decir cosas ya falsas — que
`/feed`, `/postulaciones` y `/puestos/[id]/postulantes` eran placeholders, y que
`features/<x>/hooks/` estaban vacíos salvo en 2-3 dominios.
Nada de eso es cierto hoy: los 5 dominios (`auth`, `perfil`, `puestos`, `postulaciones`,
`moderacion`) tienen sus hooks reales contra `apiClient`, y las tres pantallas mencionadas
existen y están conectadas. Se corrige acá para no volver a confiar en esa versión vieja.

**Ya NO falta (correcciones de esta pasada):**

- ⛔ **`proxy.ts` — BORRADO 2026-07-30.** Existía como guard optimista (sin cookie
  `access_token` en una ruta protegida → `/login` antes de renderizar), pero **rompía el
  login de todo usuario logueado con un loop de redirección**: el server del frontend nunca
  puede leer esa cookie, porque vive en el dominio de la API. Ver
  [Roles y control de acceso](roles-and-access-control.md) — "El acceso se valida en tres
  capas" para el detalle y por qué no se puede arreglar. El nombre de la cookie sigue
  confirmado (**A-16**, ver [Pendiente de aclarar](open-questions.md)), solo que ya no lo
  usa nadie del front.
- ✅ **`app/(empresa)/puestos/page.tsx`** ("Mis ofertas") pinta los tres estados de
  `VacancyStatus` (`PENDIENTE, PUBLICADO, FINALIZADO`, default `PUBLICADO`, A-14) vía
  `VacancyStatusBadge` + `VACANCY_STATUS_DESCRIPTION`, con "Cerrar" habilitado solo para
  `PUBLICADO` (`VacancyServiceImpl.updateVacancyStatus` del backend prohíbe cerrar desde
  `PENDIENTE` con `403`) y conectado de verdad a `PATCH /vacancy/status/{id}`
  (`use-close-job.ts`), con diálogo de confirmación.
- ✅ **`use-company-vacancies.ts`** migrado a `GET /vacancy/company/{companyId}/management`
  (`VacancyManagementResponse` — verificado contra el código fuente del backend, no
  documentado en ninguna versión de `ENDPOINTS.md`), reemplazando el `GET /vacancy` +
  un `GET /vacancy-application` por vacante de antes. El endpoint ya resuelve
  `companyName`/`areaName`/`applicationCount` y filtra `deleted = false`
  (`VacancyRepository.findManagementByCompanyId`) del lado del servidor. El badge de
  "postulantes nuevos" de `vacancy-table.tsx` pasó de "postulado en los últimos 7 días" a
  "sin revisar" (`newApplicationsCount` = postulaciones en `PENDIENTE`, decisión del
  equipo 2026-07-30) — campo renombrado a `CompanyVacancyRow.unreviewedApplicantsCount`.
- ✅ **`/perfil` es una ruta COMPARTIDA entre alumno y empresa** (route group `(perfil)`,
  guardado ALUMNO+EMPRESA): la `page.tsx` ramifica por rol y monta `CompanyProfileView` o
  `StudentProfileView` — las dos construidas, ninguna es placeholder hoy.

## El backend ya está levantado

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
otra cosa. Ver A-13 en [Pendiente de aclarar](open-questions.md).

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

## Desarrollar con sesión

La sesión siempre es la real, contra `api-dev`: los 5 dominios pegan contra `apiClient`,
así que no hay forma de ver una pantalla con datos sin una sesión válida. Para eso hace
falta un origen que el backend tenga en la whitelist de CORS (ver A-13 en
[Pendiente de aclarar](open-questions.md) — desde `localhost:3000` el `GET /me` da `401`
porque la cookie es third-party; desde `https://dev.ucutalent.tech` no).

✅ **La migración a `Role: ALUMNO|EMPRESA|ADMIN` ya se hizo** en `lib/auth.ts` y
`.env.example` (ver [Idioma del código](language-conventions.md)) — ya no queda código
usando los literales viejos (`student`/`company`/`admin`).
