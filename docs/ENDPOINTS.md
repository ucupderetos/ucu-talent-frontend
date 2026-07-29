# ENDPOINTS.md — Contrato API Frontend / Backend

> Transcripción de `UCU Talent - API Contract - Frontend / Backend` (revisión
> basada en backlog funcional actualizado, recibida 2026-07-27). Este es el
> documento que `AGENTS.md` referencia como fuente #3 ("`ENDPOINTS.md` dice
> contra qué podemos programar ahora mismo") — el contrato real, de mayor
> precedencia que el MER y el SRS. Marcado como **"Contrato funcional
> cerrado"** por el equipo de backend: las reglas de estados, transiciones,
> fechas, feed, salario y responses de postulaciones de acá son las
> acordadas para Front y Backend.
>
> Si algo de acá contradice una asunción anterior de `AGENTS.md` o de
> `types/index.ts`, gana este documento — así lo establece la tabla de
> precedencia de `AGENTS.md`.
>
> ⚠️ **Actualizado 2026-07-28 contra el código fuente real del backend**
> (`ucupderetos/ucu-talent-backend`, rama `dev` — DTOs, entidades y
> `*ServiceImpl`, no el `docs/ENDPOINTS.md` que tiene ESE repo, que en varios
> puntos no coincide ni con su propio código). Ver "Fuente #4" en `AGENTS.md`
> para el detalle de qué cambió y por qué. Las secciones 5 y 6 de acá abajo
> tienen las correcciones; el resto del documento (secciones 1–4, 7–10) no se
> re-verificó esta pasada.

## 1. Convenciones del contrato

| Tema | Contrato |
|---|---|
| Sesión | Cookie de sesión `httpOnly`. Front envía `credentials: include` en requests autenticados. |
| Usuario actual | `GET /me` hidrata la sesión y devuelve `hasProfile`. |
| IDs | `string`. |
| Fechas | `string` serializado por Backend. |
| Listados | Arrays directos. `Vacancy` no se pagina en Backend. |
| Filtros | El filtrado y la paginación visual del feed se realizan principalmente en Front. |
| Errores | 400, 401, 403, 404 y 409 según validación, permisos, existencia o transición inválida. |

### Enums principales

```
Role = ALUMNO | EMPRESA | ADMIN
AccountStatus = PENDIENTE | APROBADO | RECHAZADO
DocumentType = CEDULA_IDENTIDAD | PASAPORTE | DNI
DegreeLevel = TECNICATURA | LICENCIATURA | GRADO | POSGRADO | DOCTORADO
Modality = PRESENCIAL | HIBRIDO | REMOTO
VacancyStatus = PUBLICADO | PENDIENTE | FINALIZADO
ContractType = FULL_TIME | PART_TIME | FREELANCE | PASANTIA | CONTRATO_FIJO |
               CONTRATO_INDEFINIDO | SUPLENCIA | BECA
VacancyApplicationStatus = PENDIENTE | VISTO | FINALIZADO
```

⚠️ **`VacancyApplicationStatus` termina en `FINALIZADO` (masculino), NO
`FINALIZADA`.** Corrige una versión anterior de este documento, que decía
femenino "por postulación, para no confundir con `VacancyStatus.FINALIZADO`"
— esa distinción no existe en el wire real. Verificado contra el enum fuente
del backend (`vacancyapplication/VacancyApplicationStatus.java`), no contra
prosa.

⚠️ **`ContractType` es un enum real, no `string` libre** — verificado contra
`vacancy/ContractType.java`. Ninguna versión anterior de este documento lo
tenía como enum.

### Regla de Front

No inferir permisos por UI. Front puede ocultar acciones según role/status,
pero Backend siempre valida autorización y ownership.

## 2. Autenticación y cuentas

### Auth

| Method | Path | Access | Request | Response |
|---|---|---|---|---|
| POST | `/auth/login` | Público | `LoginRequest` | `UserResponse` + `Set-Cookie` |
| POST | `/auth/logout` | Público | - | 200 |
| GET | `/me` | Autenticado | - | `MeResponse` |

```
LoginRequest    { email, password }
MeResponse      { userId, email, role, status, registeredAt, hasProfile }
```

### User

| Method | Path | Access | Request | Response |
|---|---|---|---|---|
| POST | `/user` | Público | `CreateUserRequest` | `UserResponse` |
| GET | `/user` | ADMIN | `status?`, `role?` | `UserResponse[]` |
| GET | `/user/{id}` | Autenticado | - | `UserResponse` |
| GET | `/user?email={email}` | Autenticado | - | `UserResponse` |
| PATCH | `/user/{id}` | ADMIN | `UpdateUserStatusRequest` | `UserResponse` |
| DELETE | `/user/{id}` | Dueño | - | 204 |

```
CreateUserRequest       { email, password, role: ALUMNO | EMPRESA }
UpdateUserStatusRequest { status: APROBADO | RECHAZADO, adminComment? }
UserResponse            { userId, email, role, status, registeredAt }
```

### Registro y aprobación

| Actor | Flujo acordado |
|---|---|
| ALUMNO | Crea cuenta → queda `PENDIENTE` → completa perfil → Admin aprueba/rechaza → solo `APROBADO` puede postularse. |
| EMPRESA | Crea cuenta → queda `PENDIENTE` → completa `Company` → Admin aprueba/rechaza → solo `APROBADO` puede publicar. |

## 3. Perfiles del usuario

### StudentProfile

| Method | Path | Access | Request | Response |
|---|---|---|---|---|
| POST | `/student-profile` | ALUMNO | `CreateStudentProfileRequest` | `StudentProfileResponse` |
| GET | `/student-profile` | ADMIN | - | `StudentProfileResponse[]` |
| GET | `/student-profile/{id}` | Autenticado | - | `StudentProfileResponse` |
| GET | `/student-profile?userId={id}` | Autenticado | - | `StudentProfileResponse` |
| PUT | `/student-profile/{id}` | Dueño | `UpdateStudentProfileRequest` | `StudentProfileResponse` |
| DELETE | `/student-profile/{id}` | Dueño | - | 204 |
| GET | `/student-profile/status-summary` | ADMIN | - | `StudentProfileStatusSummaryResponse` |

```
CreateStudentProfileRequest
{ name, surname, documentType, documentNumber, phoneNumber?, linkedinUrl?, skills?, description? }

UpdateStudentProfileRequest
{ phoneNumber, linkedinUrl, skills, description }

StudentProfileResponse
{ studentProfileId, name, surname, documentType, documentNumber,
  phoneNumber, linkedinUrl, skills, status, description, reviewedAt, adminComment }
```

**Edición de perfil**: el contrato de update sigue al Backend — nombre,
apellido y documento **no** se modifican desde `UpdateStudentProfileRequest`.

### Company

| Method | Path | Access | Request | Response |
|---|---|---|---|---|
| POST | `/company` | EMPRESA | `CreateCompanyRequest` | `CompanyResponse` |
| GET | `/company` | Autenticado | - | `CompanyResponse[]` |
| GET | `/company/{id}` | Autenticado | - | `CompanyResponse` |
| GET | `/company?userId={id}` | Autenticado | - | `CompanyResponse` |
| PUT | `/company/{id}` | Dueño | `UpdateCompanyRequest` | `CompanyResponse` |
| DELETE | `/company/{id}` | Dueño | - | 204 |
| GET | `/company/status-summary` | ADMIN | - | `CompanyStatusSummaryResponse` |

```
CreateCompanyRequest / UpdateCompanyRequest
{ name, industry, description, webUrl, linkedinUrl, location }

CompanyResponse
{ companyId, name, industry, description, webUrl, linkedinUrl,
  location, status, reviewedAt, adminComment }
```

## 4. Perfil profesional y catálogos

### Education

| Method | Path | Access | Request | Response |
|---|---|---|---|---|
| POST | `/education` | Autenticado | `CreateEducationRequest` | `EducationResponse` |
| GET | `/education/{id}` | Autenticado | - | `EducationResponse` |
| GET | `/education?studentProfileId={id}` | Autenticado | - | `EducationResponse[]` |
| PUT | `/education/{id}` | Autenticado | `UpdateEducationRequest` | `EducationResponse` |
| DELETE | `/education/{id}` | Autenticado | - | 204 |

```
EducationRequest
{ studentProfileId, degreeLevel, degreeId, institution?, description?, startDate, endDate? }

EducationResponse
{ educationId, studentProfileId, degreeLevel, degreeId, institution?,
  description, startDate, endDate }
```

- `institution` es obligatoria cuando `Degree.isUcu = false`.
- `endDate` puede ser `null` cuando la educación está en curso.
- El acceso autenticado sin ownership adicional se mantiene por diseño.

### WorkExperience

| Method | Path | Access | Request | Response |
|---|---|---|---|---|
| POST | `/work-experience` | Dueño | `CreateWorkExperienceRequest` | `WorkExperienceResponse` |
| GET | `/work-experience/me/{id}` | Dueño | - | `WorkExperienceResponse` |
| GET | `/work-experience?studentProfileId={id}` | **Público** | - | `WorkExperienceResponse[]` |
| PUT | `/work-experience/{id}` | Dueño | `UpdateWorkExperienceRequest` | `WorkExperienceResponse` |
| DELETE | `/work-experience/{id}` | Dueño | - | 204 |

```
CreateWorkExperienceRequest { studentProfileId, company?, position?, startDate?, endDate?, description? }
UpdateWorkExperienceRequest { company?, position?, startDate?, endDate?, description? }
```

### Catálogos

| Recurso | Endpoints que consume Front | Uso |
|---|---|---|
| Area | `GET /area`, `GET /area/{id}` | Áreas y subáreas. |
| Degree | `GET /degree`, `GET /degree?areaId={id}` | Carreras asociadas a un área. |

## 5. Vacancies

⚠️ Toda esta sección fue reescrita 2026-07-28 contra el código fuente real
del backend (`vacancy/VacancyController.java`, `dto/*.java`,
`VacancyServiceImpl.java`) — la versión anterior (basada en el
`docs/ENDPOINTS.md` del propio repo de backend) tenía varios campos mal.

| Method | Path | Access | Request | Response |
|---|---|---|---|---|
| POST | `/vacancy` | EMPRESA + dueño + APROBADA | `CreateVacancyRequest` | `VacancyResponse` |
| GET | `/vacancy` | Autenticado | - | `VacancyResponse[]` (sin paginar) |
| GET | `/vacancy/{id}` | Autenticado | - | `VacancyResponse` |
| GET | `/vacancy/search` | Autenticado | query, todos opcionales (ver abajo) | `Page<VacancyResponse>` |
| GET | `/vacancy/student/search` | Autenticado | igual que `/search`, sin `status`/`deleted` (fuerza `PUBLICADO`) | `Page<VacancyStudentResponse>` |
| GET | `/vacancy/status/{status}` | Autenticado | - | `VacancyResponse[]` |
| GET | `/vacancy/company/{companyId}` | Autenticado | - | `VacancyResponse[]` |
| GET | `/vacancy/area/{areaId}` | Autenticado | - | `VacancyResponse[]` |
| GET | `/vacancy/modality/{modality}` | Autenticado | - | `VacancyResponse[]` |
| GET | `/vacancy/location/{location}` | Autenticado | - | `VacancyResponse[]` |
| PUT | `/vacancy/{id}` | EMPRESA + dueño | `UpdateVacancyRequest` | `VacancyResponse` |
| PATCH | `/vacancy/status/{id}` | EMPRESA + dueño | `UpdateVacancyStatusRequest` | `VacancyResponse` |
| PUT | `/vacancy/status/{id}` | **ADMIN** | `UpdateVacancyStatusAdminRequest` | `VacancyResponse` |
| DELETE | `/vacancy/{id}` | EMPRESA + dueño | - | 204 (soft-delete, ver abajo) |
| GET | `/vacancy/status-summary` | ADMIN | - | `VacancyStatusSummaryResponse` |

```
CreateVacancyRequest
{ companyId, areaId, publicationDate, closingDate, location, modality,
  name, description, requirements, contractType: ContractType, salary }
  // publicationDate/closingDate son @NotNull — el back NO las autogenera.

UpdateVacancyRequest
{ publicationDate, closingDate, location, modality, name, description,
  requirements, contractType: ContractType, salaryRange }
  // ⚠️ acá el campo de sueldo se llama `salaryRange`, no `salary` —
  // inconsistencia real del backend entre este DTO y CreateVacancyRequest,
  // no un typo de este documento. Confirmar el shape exacto que espera cada
  // endpoint, no asumir que son iguales.

UpdateVacancyStatusRequest        { status: VacancyStatus }
UpdateVacancyStatusAdminRequest   { adminComment?, status: VacancyStatus }

VacancyResponse
{ vacancyId, companyId, areaId, publicationDate, closingDate, createdAt,
  reviewedAt, updatedAt, deletedAt, deleted, adminComment, location,
  modality, status, name, description, requirements,
  contractType: ContractType, reviewedBy, salary }
  // NO tiene publishedAt ni finalizedAt (no existen en el wire real).

VacancyStudentResponse   // salida de /vacancy/student/search — subset sin campos administrativos (adminComment, reviewedBy, deleted*)

Query de /vacancy/search y /vacancy/student/search (todos opcionales, combinables con AND):
status?, areaId? (incluye subáreas), degreeId? (se resuelve vía área),
contractType?, modality?, location?, keyword? (busca en name+description),
sortBy? (default PUBLICATION_DATE), sortDirection? (default DESC),
page? (default 0), size? (default 20), deleted? (solo /search, no /student/search)
```

⚠️ **Confirmado 2026-07-29**: `contractType` deja de ser texto libre — cierra como enum
de 8 valores: `PART_TIME, FREELANCE, PASANTIA, CONTRATO_FIJO, CONTRATO_INDEFINIDO,
SUPLENCIA, BECA, FULL_TIME` (mezcla inglés/español, así los manda el backend). Front ya
migrado (`types/index.ts` → `ContractType`, catálogo en `lib/contract-types.ts`).

⚠️ **2026-07-29**: la respuesta real de `GET /vacancy` observada para "Mis
ofertas" trae, además, `publicationDate` (fecha, no datetime — no
`publishedAt`), `closingDate` (fecha de cierre planificada, no confirmada acá
antes), `createdAt`, `deletedAt`, `deleted` y `reviewedBy`, y no incluye
`finalizedAt`. Todavía no se coordinó con backend si esto reemplaza a
`publishedAt`/`finalizedAt` de arriba en todo el contrato o es una revisión
en curso — por eso esta sección no se reescribe entera. Mientras tanto,
`types/index.ts` (`Vacancy`) agrega esos campos como opcionales sin tocar los
de arriba, y solo "Mis ofertas" (`vacancy-table.tsx`,
`use-company-vacancies.ts`, `edit-job-form.tsx`) los consume. Confirmar con
backend antes de migrar el resto de las pantallas (feed, moderación).

### Estados y transiciones

| Actor | Transición | Efecto |
|---|---|---|
| EMPRESA | Crear → `PUBLICADO` | Default al crear (`@PrePersist`). Entra al feed. |
| ADMIN | `PUBLICADO → PENDIENTE` | Se genera `reviewedAt`/`reviewedBy` y puede guardarse `adminComment`. Sale del feed. No se envía mail. |
| ADMIN | `PENDIENTE → PUBLICADO` | Vuelve al feed. Solo Admin puede hacer esta transición. |
| EMPRESA | `PUBLICADO → FINALIZADO` | Terminal. Sale del feed. |
| Sistema (cron diario) | `PUBLICADO → FINALIZADO` | Automático cuando `closingDate <= hoy` (00:00 America/Montevideo) — dispara el mail de cierre a cada postulante. |

⚠️ **La empresa dueña SOLO puede cerrar desde `PUBLICADO`.** `PENDIENTE →
FINALIZADO` por la empresa está explícitamente **prohibido** —
`VacancyServiceImpl.updateVacancyStatus` devuelve `403 "El Puesto está en
revisión."` si se intenta. Una versión anterior de este documento decía que
sí se podía; era un error transcribiendo la doc del backend, no del código.

⚠️ **El Admin nunca mueve una vacante a `FINALIZADO` — por convención, no por
restricción de código.** `updateVacancyStatusAdmin` no tiene un chequeo que
lo impida explícitamente (solo bloquea si la vacante YA está `FINALIZADO`);
simplemente el front nunca ofrece esa opción en la UI de Admin. "Dar de
baja" para el Admin significa `PUBLICADO → PENDIENTE`.

**Estado terminal**: `FINALIZADO` es terminal. La empresa no puede reabrir
una vacancy finalizada, ni editarla (`PUT /vacancy/{id}` da `403`).

⚠️ **`DELETE /vacancy/{id}` es borrado lógico, no físico.** Pone
`deleted: true`, sella `deletedAt` y fuerza `status: FINALIZADO`. No se puede
borrar una vacante ya `FINALIZADO` (`403`).

⚠️ **`PUT /vacancy/{id}` (editar) se bloquea entero si la vacante ya tiene
alguna postulación** — `403 "El Puesto ya tiene postulaciones."`
(`vacancyApplicationRepository.existsByVacancyId`). No es "algunos campos
editables, otros no": es todo o nada. Resuelve A-06 en `AGENTS.md`.

### Reglas de listado y feed

- `GET /vacancy` (el listado plano) devuelve la colección sin paginación de
  Backend — y así se queda, no es un estado transitorio.
- `GET /vacancy/search` y `GET /vacancy/student/search` SÍ paginan y filtran
  del lado del servidor (ver arriba) — el frontend no los usa todavía, sigue
  trayendo `GET /vacancy` completo y filtrando/paginando en memoria.
- Feed de alumno (si se sigue usando `GET /vacancy` sin más): filtrar por
  `status === "PUBLICADO"` en el cliente.
- Al filtrar por área se consideran sus subáreas (tanto en memoria como en
  `/search`).
- Keyword se aplica sobre `name` y `description`.
- `salary`/`salaryRange`: ver el aviso arriba, son nombres DISTINTOS según el
  endpoint (create vs. update) — no se unifican en este documento porque el
  backend tampoco los unificó.

## 6. Postulaciones

⚠️ Toda esta sección fue reescrita 2026-07-28 contra el código fuente real
del backend (`vacancyapplication/VacancyApplicationController.java`,
`dto/*.java`, `VacancyApplicationServiceImpl.java`).

| Method | Path | Access | Request | Response |
|---|---|---|---|---|
| POST | `/vacancy-application` | ALUMNO + APROBADO | `CreateVacancyApplicationRequest` | `VacancyApplicationResponse` |
| GET | `/vacancy-application/me` | ALUMNO | - | `VacancyApplicationStudentResponse[]` |
| GET | `/vacancy-application/{id}` | Empresa dueña | - | `VacancyApplicationResponse` |
| GET | `/vacancy-application` | ADMIN | - | `VacancyApplicationResponse[]` |
| GET | `/vacancy-application?vacancyId={id}` | Empresa dueña | - | `VacancyApplicationResponse[]` |
| GET | `/vacancy-application?studentProfileId={id}` | ADMIN | - | `VacancyApplicationResponse[]` |
| GET | `/vacancy-application?status={status}` | ADMIN | - | `VacancyApplicationResponse[]` |
| PUT | `/vacancy-application/{id}` | Empresa dueña | `UpdateVacancyApplicationRequest` | `VacancyApplicationResponse` |
| PATCH | `/vacancy-application/{id}/accept` | Empresa dueña | - | `VacancyApplicationResponse` |
| DELETE | `/vacancy-application/{id}` | Alumno postulante (dueño) | - | 204 |
| GET | `/vacancy-application/status-summary` | ADMIN | - | `VacancyApplicationStatusSummaryResponse` |

```
CreateVacancyApplicationRequest
{ vacancyId, studentProfileId, status?, appliedAt? }
// ⚠️ studentProfileId es @NotBlank en el DTO — el controller lo pisa con el
// del token (jwt.getSubject()) antes de usarlo, así que el VALOR es
// decorativo, pero mandar el body SIN el campo hace fallar la validación
// con 400 igual. No se puede mandar solo { vacancyId }.

UpdateVacancyApplicationRequest    { status: VISTO | FINALIZADO }

VacancyApplicationResponse
{ vacancyApplicationId, vacancyId, studentProfileId, status, appliedAt,
  accepted: boolean }
// accepted: default false, solo lo pone en true PATCH .../accept.
// Visible para empresa dueña y ADMIN.

VacancyApplicationStudentResponse   // salida de GET /vacancy-application/me
{ vacancyApplicationId, vacancyId, studentProfileId, status, appliedAt }
// SIN vacancyName/companyId/companyName/vacancyStatus/accepted — el alumno
// no ve nada resuelto, ni el flag de resultado. Front tiene que cruzar
// contra GET /vacancy + GET /company + GET /area para armar la fila
// completa (ver use-my-applications.ts).
```

⚠️ **`accepted` SÍ existe — reversión de una reversión.** Una versión
anterior de este documento (alineada con `docs/ENDPOINTS.md` del repo de
backend, que tampoco lo tenía) decía que no había campo de selección.
Verificado contra el código fuente: existe, se llama `accepted` (no
`selected` como en el MER), y define el contenido del mail de cierre
(`VacancyFinalizationNotifier`: `accepted === true` → mail de "seleccionado",
si no → mail de cierre genérico). No viaja en la respuesta de `/me` — el
alumno nunca lo ve, a propósito.

⚠️ **NO existe `VacancyApplicantResponse` con `studentName` resuelto.** Una
versión anterior de este documento (y del código de `features/postulaciones/`)
asumía que `GET /vacancy-application?vacancyId={id}` devolvía el nombre del
alumno ya resuelto. El controller real (`getByVacancyId`) devuelve
`List<VacancyApplicationResponse>` — el mismo shape de siempre, sin
`studentName`. Para armar la tabla de "Postulantes" con nombre hace falta
resolver `StudentProfile` por `studentProfileId` aparte.

### Flujo de estado

`PENDIENTE → VISTO → FINALIZADO`

- Una transición inválida (retroceder) devuelve 409 y no modifica la
  postulación.
- `PENDIENTE → VISTO` y `VISTO → FINALIZADO` son las DOS acciones explícitas
  de la empresa dueña vía `PUT /vacancy-application/{id}` — ⚠️ **ninguna es
  automática**. En particular, cerrar la vacante (por la empresa o por el
  cron de `closingDate`, ver sección 5) NO cambia el status de sus
  postulaciones — solo dispara el mail de cierre. Una versión anterior de
  este documento decía que `VISTO → FINALIZADO` era "automático, en cascada
  al finalizar el puesto" — no es así en el código real.
- La empresa puede acceder al perfil completo de los postulantes de sus
  propias vacancies (fetch aparte a `StudentProfile`/`Education`/`WorkExperience`,
  no viene resuelto en `VacancyApplicationResponse`).
- Postularse exige, además del rol/estado de cuenta: que la vacante esté
  `PUBLICADO` (`409` si no) y que el alumno tenga **al menos un registro de
  `Education`** (`409` si no tiene ninguno) — este último no estaba
  confirmado en ninguna versión anterior de este documento.
- El alumno puede **retirar su propia postulación**: `DELETE
  /vacancy-application/{id}`, dueño = el alumno postulante. No documentado
  en ninguna versión anterior.
- Los correos automáticos de postulaciones y cambios de estado forman parte
  del flujo, pero su implementación sigue en desarrollo.

## 7. Moderación y Admin

| Necesidad | Endpoint / mecanismo |
|---|---|
| Alumnos pendientes | `GET /student-profile` y/o `GET /user?status=PENDIENTE&role=ALUMNO` |
| Aprobar/rechazar alumno | `PATCH /user/{id}` |
| Empresas | `GET /company` + filtros en Front / composición con `User` cuando corresponda |
| Aprobar/rechazar empresa | `PATCH /user/{id}` |
| Moderación de vacancy | `PUT /vacancy/status/{id}` |
| Totales alumnos | `GET /student-profile/status-summary` |
| Totales empresas | `GET /company/status-summary` |
| Totales vacancies | `GET /vacancy/status-summary` |
| Totales postulaciones | `GET /vacancy-application/status-summary` |

**Moderación de vacancy**: dar de baja significa `PUBLICADO → PENDIENTE`. Se
conservan las postulaciones y no existe baja física como parte del flujo de
moderación.

## 8. Mapa de integración para Front

| Pantalla / acción | Calls principales |
|---|---|
| Login | `POST /auth/login` → `GET /me` |
| Registro alumno | `POST /user` → `POST /student-profile` → `GET /me` |
| Registro empresa | `POST /user` → `POST /company` → `GET /me` |
| Perfil alumno | `StudentProfile` + `Education` + `WorkExperience` |
| Feed | `GET /vacancy` + catálogos Area/Degree; filtros y paginación en Front |
| Detalle vacancy | `GET /vacancy/{id}` + `GET /company/{companyId}` |
| Postularse | `POST /vacancy-application` |
| Mis postulaciones | `GET /vacancy-application/me` |
| Puestos de empresa | `GET /vacancy` y filtrar por `companyId` |
| Crear/editar puesto | `POST /vacancy`, `PUT /vacancy/{id}` |
| Finalizar puesto | `PATCH /vacancy/status/{id}` |
| Postulantes | `GET /vacancy-application?vacancyId={id}` |
| Cambiar estado postulante | `PUT /vacancy-application/{id}` |
| Admin | `User`/`Profile`/`Company` + status-summary + `PUT /vacancy/status/{id}` |

## 9. Endpoints internos o secundarios

| Recurso | Uso |
|---|---|
| `/admin` | Perfil de usuarios ADMIN. No es parte central del flujo de producto. |
| `/university-registry` | CRUD administrativo existente. No participa del registro funcional acordado. |
| `/audit` | Auditoría interna. No usar desde la UI general. |
| `/dev/admin` | Temporal de desarrollo. No debe existir en entornos compartidos o producción. |

## 10. Estado del contrato

**Contrato funcional cerrado.** Las reglas de estados, transiciones, fechas,
feed, salario y responses de postulaciones de este documento son las
acordadas para Front y Backend. Si se recibe una revisión posterior del
contrato, este archivo se actualiza — no se acumulan versiones viejas acá.
