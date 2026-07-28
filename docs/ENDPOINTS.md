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
VacancyApplicationStatus = PENDIENTE | VISTO | FINALIZADA
```

⚠️ `VacancyApplicationStatus` termina en **`FINALIZADA`** (femenino, por
"postulación") — no confundir con `VacancyStatus.FINALIZADO`.

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

| Method | Path | Access | Request | Response |
|---|---|---|---|---|
| POST | `/vacancy` | EMPRESA + dueño + APROBADA | `CreateVacancyRequest` | `VacancyResponse` |
| GET | `/vacancy` | Autenticado | - | `VacancyResponse[]` |
| GET | `/vacancy/{id}` | Autenticado | - | `VacancyResponse` |
| PUT | `/vacancy/{id}` | EMPRESA + dueño | `UpdateVacancyRequest` | `VacancyResponse` |
| PATCH | `/vacancy/status/{id}` | EMPRESA + dueño | `UpdateVacancyStatusRequest` | `VacancyResponse` |
| PUT | `/vacancy/status/{id}` | **ADMIN** | `UpdateVacancyStatusAdminRequest` | `VacancyResponse` |
| GET | `/vacancy/status-summary` | ADMIN | - | `VacancyStatusSummaryResponse` |

```
CreateVacancyRequest
{ companyId, areaId, location, modality, name, description,
  requirements, contractType, salaryRange }

UpdateVacancyRequest
{ location, modality, name, description, requirements, contractType, salaryRange }

VacancyResponse
{ vacancyId, companyId, areaId, location, modality, status,
  name, description, requirements, contractType, salaryRange,
  publishedAt, reviewedAt, updatedAt, finalizedAt, adminComment? }
```

### Estados y transiciones

| Actor | Transición | Efecto |
|---|---|---|
| EMPRESA | Crear → `PUBLICADO` | Se genera `publishedAt`. La vacancy entra al feed. |
| ADMIN | `PUBLICADO → PENDIENTE` | Se genera `reviewedAt` y puede guardarse `adminComment`. Sale del feed. No se envía mail. |
| ADMIN | `PENDIENTE → PUBLICADO` | Vuelve al feed. Solo Admin puede hacer esta transición. |
| EMPRESA | `PUBLICADO → FINALIZADO` | Se genera `finalizedAt`. Sale del feed. |
| EMPRESA | `PENDIENTE → FINALIZADO` | Se genera `finalizedAt`. No se envía mail. |

⚠️ **El Admin nunca mueve una vacante a `FINALIZADO`.** Sus dos únicas
transiciones son `PUBLICADO ↔ PENDIENTE` (vía `PUT /vacancy/status/{id}`).
"Dar de baja" para el Admin significa `PUBLICADO → PENDIENTE`, no un cierre
terminal — cerrar la vacante es una acción exclusiva de la empresa dueña
(`PATCH /vacancy/status/{id}`), desde `PUBLICADO` o desde `PENDIENTE`.

**Estado terminal**: `FINALIZADO` es terminal. La empresa no puede reabrir
una vacancy finalizada.

### Reglas de listado y feed

- `GET /vacancy` devuelve la colección sin paginación de Backend.
- Front realiza paginación visual y la mayoría de los filtros.
- Feed muestra solo `status PUBLICADO`.
- Filtros de Front: área, carrera vía área, tipo de contrato, modalidad,
  localidad y keyword.
- Al filtrar por área se consideran sus subáreas.
- Keyword se aplica sobre `name` y `description`.
- `salaryRange` permanece como `string` (no se renombra a `salary`).

## 6. Postulaciones

| Method | Path | Access | Request | Response |
|---|---|---|---|---|
| POST | `/vacancy-application` | ALUMNO + APROBADO | `CreateVacancyApplicationRequest` | `VacancyApplicationResponse` |
| GET | `/vacancy-application/me` | ALUMNO | - | `MyVacancyApplicationResponse[]` |
| GET | `/vacancy-application/{id}` | Empresa dueña | - | `VacancyApplicationResponse` |
| GET | `/vacancy-application?vacancyId={id}` | Empresa dueña | - | `VacancyApplicantResponse[]` |
| GET | `/vacancy-application?studentProfileId={id}` | ADMIN | - | `VacancyApplicationResponse[]` |
| PUT | `/vacancy-application/{id}` | Empresa dueña | `UpdateVacancyApplicationRequest` | `VacancyApplicationResponse` |
| GET | `/vacancy-application/status-summary` | ADMIN | - | `VacancyApplicationStatusSummaryResponse` |

```
CreateVacancyApplicationRequest    { vacancyId }
UpdateVacancyApplicationRequest    { status: VISTO | FINALIZADA }

VacancyApplicationResponse
{ vacancyApplicationId, vacancyId, studentProfileId, status, appliedAt }

MyVacancyApplicationResponse
{ vacancyApplicationId, vacancyId, vacancyName, companyId, companyName,
  appliedAt, status, vacancyStatus }

VacancyApplicantResponse
{ vacancyApplicationId, vacancyId, studentProfileId, studentName,
  status, appliedAt }
```

⚠️ **No hay campo `selected` en ningún lado de este contrato.** Ver el aviso
en `VacancyApplication`, `types/index.ts` — se trata como una reversión de
la confirmación previa de A-17 en `AGENTS.md`, no como un olvido del
documento.

### Flujo de estado

`PENDIENTE → VISTO → FINALIZADA`

- Una transición inválida devuelve 409 y no modifica la postulación.
- La empresa puede acceder al perfil completo de los postulantes de sus
  propias vacancies.
- `GET /vacancy-application/me` ya devuelve puesto, empresa y estado actual
  de la vacancy — Front no necesita reconstruir cada item con requests
  adicionales.
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
