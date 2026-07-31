// Tipos globales compartidos por toda la app.
//
// Acá viven las ENTIDADES CORE del modelo de datos: espejan las tablas del MER
// y el contrato real de la API (docs/ENDPOINTS.md del backend, rama `dev`).
// Cruzan más de un dominio (ej. `Vacancy` la usan vacantes, moderación y
// postulaciones), y como la regla del equipo es "no importar desde features/ de
// otro dominio", suben acá.
//
// Lo específico de un dominio (filtros, payloads de formulario, view models) va
// en features/<x>/types.ts, no acá.
//
// Convención de idioma (confirmada por el equipo tras leer el contrato real):
// identificadores (nombres de tipos/props) en inglés, PERO los valores de los
// enums de dominio mirroran el wire tal cual lo manda el backend — que es en
// español y en mayúsculas (`Role`, `AccountStatus`, `VacancyStatus`, etc.). No
// hay capa de traducción: traducir agregaría una fuente de bugs (olvidarse de
// mapear un campo) sin ningún beneficio real, ahora que se conoce el contrato.
//
// ⚠️ El backend está en desarrollo activo: varias secciones más abajo señalan
// gaps confirmados en docs/ENDPOINTS.md (roadmap items), no asunciones nuestras.

// ---------------------------------------------------------------------------
// Usuario, cuenta y roles
// ---------------------------------------------------------------------------
//
// Tras el refactor del backend, `User` es SOLO identidad + autenticación:
// email, passwordHash (nunca expuesto), role, status, registeredAt. Los datos
// personales (nombre, apellido, documento, industria...) viven en entidades de
// perfil separadas con PK COMPARTIDA con `User`: `StudentProfile`, `Company`,
// `Admin`. Por eso `User` ya no tiene `name`/`surname`/`documentType`/etc. —
// hay que pedirle esos campos al perfil correspondiente (ver más abajo).

/** Wire: `Role` — registro público solo permite `ALUMNO` | `EMPRESA`; `ADMIN`
 *  se crea hoy por el endpoint temporal `/dev/admin` (ver sección Dev). */
export type Role = "ALUMNO" | "EMPRESA" | "ADMIN";

/**
 * Wire: `AccountStatus`. Reemplaza a lo que iba a ser `Company.approved`
 * (booleano) — ahora es un enum y aplica a LOS TRES roles, no solo a empresa.
 * Toda cuenta nace `PENDIENTE` (excepto el admin de `/dev/admin`, que nace
 * `APROBADO` directo). Resuelve la deuda que tenía el booleano: ahora si se
 * puede distinguir "rechazada" de "todavía no revisada".
 *
 * ✅ Resuelto (A-02, `docs/ENDPOINTS.md`): `PATCH /user/{id}` (ADMIN) recibe
 * `UpdateUserStatusRequest { status: APROBADO | RECHAZADO, adminComment? }`
 * y aprueba/rechaza tanto alumno como empresa. Ver `use-review-account.ts`,
 * conectado al endpoint real.
 */
export type AccountStatus = "PENDIENTE" | "APROBADO" | "RECHAZADO";

/** Wire: `common.DocumentType` — enum único compartido entre `StudentProfile`
 *  y `UniversityRegistry`. */
export type DocumentType = "CEDULA_IDENTIDAD" | "PASAPORTE" | "DNI";

/** Wire: `Department` (19 valores) — comparten los mismos literales
 *  `Vacancy.location` y `Company.location` (ahí se llama `Departamento`). */
export type Department =
  | "ARTIGAS"
  | "CANELONES"
  | "CERRO_LARGO"
  | "COLONIA"
  | "DURAZNO"
  | "FLORES"
  | "FLORIDA"
  | "LAVALLEJA"
  | "MALDONADO"
  | "MONTEVIDEO"
  | "PAYSANDU"
  | "RIO_NEGRO"
  | "RIVERA"
  | "ROCHA"
  | "SALTO"
  | "SAN_JOSE"
  | "SORIANO"
  | "TACUAREMBO"
  | "TREINTA_Y_TRES";

/**
 * Wire: `UserResponse` / `MeResponse`. Identidad pura — nunca expone
 * `passwordHash`. NO tiene nombre: para mostrar un nombre en UI hay que
 * combinarlo con el perfil (`StudentProfile`/`Company`/`Admin`) del mismo id.
 */
export interface User {
  userId: string;
  email: string;
  role: Role;
  status: AccountStatus;
  registeredAt: string; // ISO 8601
  /**
   * NO viene en `UserResponse`/`MeResponse`. Lo completa
   * `hooks/use-session.ts` con una segunda consulta al perfil
   * del rol (`/student-profile`, `/company` o `/admin`), para que
   * `components/layout/navbar.tsx` pueda mostrar un nombre sin tener que leer
   * la sesión él mismo (recibe el usuario ya armado por props). `undefined`
   * mientras esa segunda consulta no resolvió.
   */
  name?: string;
  /** Igual que `name`. Las empresas no tienen apellido (`CompanyResponse` no
   *  lo trae) — queda `undefined` en ese caso. */
  surname?: string;
  /**
   * Foto de perfil, para los tres roles. ⚠️ **Es la key del objeto en el
   * storage, NO una URL** (ej. `"users/profile-image/9f3c…​.png"`): para
   * mostrarla hay que canjearla por una URL firmada con
   * `GET /user/profile-image?profileObject={key}` — ver `hooks/use-profile-image.ts`.
   *
   * Viene en `UserResponse` (`GET /user/{id}`), **no** en `MeResponse`, así que
   * `useSession()` no la tiene: quien necesite la foto pide el `User` completo.
   * `null` si el usuario nunca subió una o la borró.
   */
  profileImage?: string | null;
}

// ---------------------------------------------------------------------------
// Áreas (taxonomía jerárquica)
// ---------------------------------------------------------------------------

/**
 * Wire: `AreaResponse`. `Area` clasifica TANTO `Degree` como `Vacancy`, y es
 * jerárquica. Es el mecanismo del RF-14: ordenar el feed por coincidencia =
 * matchear el área de la carrera del alumno contra el área de la vacante.
 * Matching por reglas, no IA/ML — por eso no choca con "fuera de alcance".
 */
export interface Area {
  areaId: string;
  name: string;
  /** null en las áreas raíz. */
  parentAreaId: string | null;
}

// ---------------------------------------------------------------------------
// Empresa
// ---------------------------------------------------------------------------

/**
 * Wire: `CompanyPublicResponse` — la empresa SIN los campos de moderación
 * (`reviewedAt`/`adminComment`). Es lo que embeben los DTOs resueltos del
 * backend (hoy `GET /vacancy/{id}/resolved`), no lo que devuelve
 * `GET /company/{id}` — ese trae `CompanyResponse`, o sea `Company` completa.
 * Tiparlo aparte evita prometer campos que en runtime no llegan.
 */
export interface CompanyPublic {
  companyId: string;
  /** Razón social — `Company` sí tiene nombre propio (a diferencia de lo que
   *  se asumía antes de tener el contrato). */
  name: string;
  industry: string;
  description: string;
  webUrl: string;
  linkedinUrl: string;
  location: Department;
  status: AccountStatus;
}

/**
 * Wire: `CompanyResponse`. No expone `userId` (la PK ya lo es: `companyId` =
 * `userId`). `status`/`reviewedAt`/`adminComment` SÍ vienen acá (confirmado en
 * `docs/ENDPOINTS.md`) además de en `User.status` — es la misma aprobación,
 * duplicada en la respuesta para que la pantalla de perfil no necesite un
 * segundo fetch a `/user/{companyId}` solo para mostrarla.
 */
export interface Company extends CompanyPublic {
  /** null hasta que un Admin la revise. */
  reviewedAt: string | null;
  /** Motivo del rechazo o nota de revisión, si el Admin la cargó. */
  adminComment: string | null;
}

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

/** Wire: `AdminResponse`. */
export interface Admin {
  adminId: string;
  name: string;
  surname: string;
}

// ---------------------------------------------------------------------------
// Perfil del alumno
// ---------------------------------------------------------------------------

/**
 * Wire: `StudentProfileResponse`. Entidad distinta de `User`, con PK
 * compartida (`studentProfileId` = `userId`). `VacancyApplication` apunta a
 * `studentProfileId`, NO a `userId`.
 *
 * `status`/`reviewedAt`/`adminComment` — mismo criterio que en `Company`:
 * duplican la aprobación de `User.status` acá para no requerir un segundo
 * fetch a `/user/{studentProfileId}` solo para mostrarla en el perfil.
 */
export interface StudentProfile {
  studentProfileId: string;
  name: string;
  surname: string;
  documentType: DocumentType;
  documentNumber: string;
  phoneNumber: string | null;
  linkedinUrl: string | null;
  skills: string[];
  description: string | null;
  /**
   * **Key del objeto en el storage, NO una URL** (`{carpeta}/{UUID}.pdf`) —
   * mismo patrón que `User.profileImage`. Se canjea por una URL firmada con
   * `GET /student-profile/cv?cvFile={key}` (ver A-24 en
   * `docs/agents/open-questions.md` y `features/perfil/hooks/use-cv.ts`).
   * null si el alumno no subió CV.
   */
  cvFile: string | null;
  status: AccountStatus;
  /** null hasta que un Admin lo revise. */
  reviewedAt: string | null;
  /** Motivo del rechazo o nota de revisión, si el Admin la cargó. */
  adminComment: string | null;
}

export interface Degree {
  degreeId: string;
  areaId: string;
  name: string;
  /** Distingue carreras de la UCU de las externas. */
  isUcu: boolean;
}

/** Wire: `Education.DegreeLevel`. */
export type DegreeLevel =
  | "TECNICATURA"
  | "LICENCIATURA"
  | "GRADO"
  | "POSGRADO"
  | "DOCTORADO";

/** Un alumno puede tener N carreras — no hay un campo plano "carrera". */
export interface Education {
  educationId: string;
  studentProfileId: string;
  degreeLevel: DegreeLevel;
  degreeId: string;
  /** Obligatoria cuando `Degree.isUcu === false` — null en carreras UCU. */
  institution: string | null;
  description: string | null;
  startDate: string; // ISO 8601
  /** null si está en curso. */
  endDate: string | null;
}

export interface WorkExperience {
  workExperienceId: string;
  studentProfileId: string;
  /** Texto libre: no es un FK a `Company`, puede ser cualquier empleador.
   *  Todos los campos son opcionales en el wire (`CreateWorkExperienceRequest`
   *  no los marca `@NotBlank`). */
  company: string | null;
  position: string | null;
  startDate: string | null; // ISO 8601
  /** null si es el trabajo actual. */
  endDate: string | null;
  description: string | null;
}

// ---------------------------------------------------------------------------
// Registro universitario (RF-01: validación de alumnos contra padrón)
// ---------------------------------------------------------------------------

/** Wire: `UniversityRegistryResponse`. Padrón de alumnos válidos de la UCU,
 *  usado para RF-01. No tiene relación de FK explícita con `User` en el
 *  contrato — se usa para validar, no se referencia después. */
export interface UniversityRegistry {
  universityRegistryId: string;
  documentType: DocumentType;
  documentNumber: string;
  name: string;
  surname: string;
}

// ---------------------------------------------------------------------------
// Vacantes
// ---------------------------------------------------------------------------

export type Modality = "PRESENCIAL" | "HIBRIDO" | "REMOTO";

/**
 * Wire: `Vacancy.contractType`. Confirmado 2026-07-29 como enum cerrado de 8
 * valores — cierra el punto de A-15 que decía "sigue siendo `string` libre,
 * el contrato cerrado no confirma un enum ni sus valores". Los valores
 * llegan mezclando inglés (`PART_TIME`, `FREELANCE`, `FULL_TIME`) y español
 * (`PASANTIA`, `CONTRATO_FIJO`, `CONTRATO_INDEFINIDO`, `SUPLENCIA`, `BECA`)
 * — así los manda el backend, no se homogeneízan (mismo criterio que el
 * resto de los enums: los valores no se traducen — ver
 * `docs/agents/language-conventions.md`). El catálogo y las labels de presentación viven en
 * `lib/contract-types.ts`.
 */
export type ContractType =
  | "PART_TIME"
  | "FREELANCE"
  | "PASANTIA"
  | "CONTRATO_FIJO"
  | "CONTRATO_INDEFINIDO"
  | "SUPLENCIA"
  | "BECA"
  | "FULL_TIME";

/**
 * Wire: `VacancyStatus`. Post-moderación (DEC-01): la vacante **nace
 * `PUBLICADO`**, sin aprobación previa. No existe `RECHAZADO`.
 *
 * | Estado | Significa | Quién puede ponerlo |
 * |---|---|---|
 * | `PUBLICADO` | Viva y visible en el feed del alumno. Es el default al crearla | Empresa (al crear), Admin (`PENDIENTE → PUBLICADO`) |
 * | `PENDIENTE` | Retirada del feed para revisar o corregir algo. NO visible | Admin (`PUBLICADO → PENDIENTE`, "dar de baja") |
 * | `FINALIZADO` | Terminal. Cierre de la búsqueda | **Solo la empresa dueña**, desde `PUBLICADO` o desde `PENDIENTE` (RF-PUE-03) |
 *
 * ⚠️ **El Admin NUNCA mueve una vacante a `FINALIZADO`.** Sus únicas dos
 * transiciones son `PUBLICADO ↔ PENDIENTE` (`PUT /vacancy/status/{id}`,
 * confirmado en `docs/ENDPOINTS.md`) — "dar de baja" para el Admin significa
 * `PUBLICADO → PENDIENTE`, no el cierre terminal. Cerrar la vacante
 * (`FINALIZADO`) es una acción exclusiva de la empresa dueña
 * (`PATCH /vacancy/status/{id}`), desde cualquiera de los otros dos estados.
 * Este párrafo antes decía lo contrario (que el Admin daba de baja a
 * `FINALIZADO`) — corregido contra el contrato cerrado.
 */
export type VacancyStatus = "PENDIENTE" | "PUBLICADO" | "FINALIZADO";

/**
 * Wire: `VacancyResponse` (`vacancy/dto/VacancyResponse.java`, fuente del
 * backend — no coincide con `docs/ENDPOINTS.md` de ningún lado del repo, ni
 * el local ni el del backend: ninguno de los dos documentaba `publicationDate`/
 * `closingDate`/`createdAt`/`deletedAt`/`deleted`/`reviewedBy`, y los dos
 * tenían `salaryRange` en vez de `salary`).
 *
 * ⚠️ **No hay `publishedAt`/`finalizedAt`.** La fecha de publicación la
 * define la EMPRESA al crear el puesto (`publicationDate`, obligatoria en
 * `CreateVacancyRequest` — no autogenerada), y no hay timestamp de cierre
 * (`FINALIZADO` no sella nada nuevo, solo cambia `status`/`updatedAt`).
 *
 * ⚠️ **`closingDate` dispara un cron diario en Backend**
 * (`VacancyServiceImpl.finalizeExpiredVacancies`, 00:00 America/Montevideo):
 * toda vacante `PUBLICADO` con `closingDate <= hoy` pasa sola a `FINALIZADO`
 * y dispara el mail de cierre a cada postulante — sin acción de la empresa.
 * Es la primera fuente de verdad de "cuándo se cierra un puesto", no algo
 * que el frontend necesite simular.
 *
 * ⚠️ **`deleted`/`deletedAt`**: `DELETE /vacancy/{id}` es borrado lógico, no
 * físico — pone `status: FINALIZADO`, `deleted: true`, sella `deletedAt`. Un
 * puesto ya `FINALIZADO` no se puede volver a borrar (`403`).
 */
export interface Vacancy {
  vacancyId: string;
  companyId: string;
  areaId: string;
  /** El título del puesto. En el MER/wire es `name`, no `title`. */
  name: string;
  description: string;
  requirements: string;
  contractType: ContractType;
  salary: string;
  modality: Modality;
  status: VacancyStatus;
  location: Department;
  /** ISO 8601 (fecha), la define la empresa al crear — no autogenerada. */
  publicationDate: string;
  /** ISO 8601 (fecha), obligatoria al crear — dispara el auto-cierre por cron. */
  closingDate: string;
  /** ISO 8601 (datetime), se sella al crearse. */
  createdAt: string;
  /** Se sella cada vez que el Admin mueve la vacante PUBLICADO ↔ PENDIENTE. */
  reviewedAt: string | null; // ISO 8601 (datetime)
  updatedAt: string | null; // ISO 8601 (datetime)
  deletedAt: string | null; // ISO 8601 (datetime), soft-delete
  deleted: boolean;
  /** userId del Admin que hizo la última revisión (`PUT /vacancy/status/{id}`). */
  reviewedBy: string | null;
  /** Nota del Admin, si la cargó al pasarla a `PENDIENTE`. */
  adminComment: string | null;
}

// ---------------------------------------------------------------------------
// Postulaciones
// ---------------------------------------------------------------------------

/**
 * Wire: `VacancyApplicationStatus` (`vacancyapplication/VacancyApplicationStatus.java`).
 * La transición NO retrocede (lo valida el backend, `409` si se intenta).
 *
 * ⚠️ **El valor terminal es `FINALIZADO` (masculino), NO `FINALIZADA`.**
 * Una versión anterior de este archivo (y de `docs/agents/applications-state-machine.md`)
 * insistía en que era
 * femenino "por postulación", para no confundirlo con `VacancyStatus.FINALIZADO`
 * — esa distinción NO existe en el wire real: los dos enums usan la misma
 * palabra. Verificado contra el enum fuente del backend, no contra prosa.
 */
export type VacancyApplicationStatus = "PENDIENTE" | "VISTO" | "FINALIZADO";

/**
 * Wire: `VacancyApplicationResponse` (`vacancyapplication/dto/VacancyApplicationResponse.java`)
 * — `{ vacancyApplicationId, vacancyId, studentProfileId, status, appliedAt, accepted }`.
 *
 * ⚠️ **`accepted` volvió — reversión de una reversión.** El MER aprobado
 * tenía `selected` (DEC-06); `docs/ENDPOINTS.md` (versión anterior, recibida
 * 2026-07-27) no lo incluía en ningún lado y se lo dio por eliminado — ver
 * `application-progress.tsx`. Verificado contra el código fuente del backend
 * (`dev`, no contra ese doc): el campo existe, se llama `accepted` (no
 * `selected`) y es un booleano de solo-lectura para el alumno — se marca con
 * `PATCH /vacancy-application/{id}/accept` (empresa dueña, sin operación
 * inversa) y define el contenido del mail de cierre
 * (`sendVacancySelectedEmail` vs `sendVacancyClosedEmail`,
 * `VacancyFinalizationNotifier.java`). **No viaja en
 * `VacancyApplicationStudentResponse`** (`GET /vacancy-application/me`) — el
 * alumno sigue sin poder ver si quedó seleccionado, el gap que
 * `application-progress.tsx` documenta sigue siendo real del lado del alumno,
 * aunque la empresa/admin sí lo vean.
 */
export interface VacancyApplication {
  vacancyApplicationId: string;
  vacancyId: string;
  /** Apunta a `StudentProfile.studentProfileId`, NO a `User.userId`. */
  studentProfileId: string;
  status: VacancyApplicationStatus;
  appliedAt: string; // ISO 8601
  /** Solo presente para empresa dueña/ADMIN — ver el aviso arriba. */
  accepted: boolean;
}

// ---------------------------------------------------------------------------
// Payloads compartidos entre dominios
// ---------------------------------------------------------------------------

// Los inputs del paso 3 del registro (`POST /student-profile` / `POST /company`)
// los usan DOS dominios: `auth` (camino feliz, `use-register.ts`) y `perfil`
// (reintento desde `/completar-perfil`, `use-complete-profile.ts`). Por eso
// suben acá — un tipo que cruza dominios no puede vivir en `features/auth/types`
// sin romper la regla "no importar features/ de otro dominio". Ver
// `docs/agents/roles-and-access-control.md` ("Registro en dos pasos y ProfileGuard").

/**
 * `POST /student-profile` — paso 3 del registro si el rol es `ALUMNO`.
 * `phoneNumber`, `linkedinUrl` y `skills` son opcionales en el backend: no
 * bloquean el alta, se completan después desde `/perfil`.
 */
export interface StudentProfileRegistrationInput {
  name: string;
  surname: string;
  documentType: DocumentType;
  documentNumber: string;
  phoneNumber?: string;
  linkedinUrl?: string;
  skills?: string[];
}

/**
 * `POST /company` — paso 3 del registro si el rol es `EMPRESA`. Todos los
 * campos son `@NotBlank` en el backend: no hay forma de diferir ninguno.
 */
export interface CompanyRegistrationInput {
  name: string;
  industry: string;
  description: string;
  webUrl: string;
  linkedinUrl: string;
  location: Department;
}

// ---------------------------------------------------------------------------
// Utilidades cross-domain
// ---------------------------------------------------------------------------

/** Envoltorio genérico de paginación — lo usa cualquier listado paginado, sin importar el dominio. */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
}
