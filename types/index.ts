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
 * ⚠️ GAP CONFIRMADO: `docs/ENDPOINTS.md` no tiene NINGÚN endpoint para pasar
 * una cuenta de `PENDIENTE` a `APROBADO`/`RECHAZADO`. La sección 1 (`/user`)
 * solo tiene POST/GET/DELETE, sin PUT. Esto bloquea RF-12 y RF-13 tal como
 * están hoy: no hay forma de que Admin UCU apruebe una empresa ni un alumno
 * desde el frontend porque el backend no expone la acción todavía. Confirmar
 * con el equipo de backend antes de construir `(admin)/moderacion`.
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
 * Wire: `CompanyResponse`. No expone `userId` (la PK ya lo es: `companyId` =
 * `userId`). `status`/`reviewedAt`/`adminComment` SÍ vienen acá (confirmado en
 * `docs/ENDPOINTS.md`) además de en `User.status` — es la misma aprobación,
 * duplicada en la respuesta para que la pantalla de perfil no necesite un
 * segundo fetch a `/user/{companyId}` solo para mostrarla.
 */
export interface Company {
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

/** Wire: `VacancyResponse`. */
export interface Vacancy {
  vacancyId: string;
  companyId: string;
  areaId: string;
  /** El título del puesto. En el MER/wire es `name`, no `title`. */
  name: string;
  description: string;
  requirements: string;
  contractType: string;
  salaryRange: string;
  modality: Modality;
  status: VacancyStatus;
  location: Department;
  publishedAt: string | null; // ISO 8601, se sella al crearse (nace PUBLICADO)
  /** Se sella cada vez que el Admin mueve la vacante PUBLICADO ↔ PENDIENTE. */
  reviewedAt: string | null; // ISO 8601
  updatedAt: string | null; // ISO 8601
  finalizedAt: string | null; // ISO 8601, terminal
  /** Nota del Admin, si la cargó al pasarla a `PENDIENTE`. */
  adminComment?: string | null;
}

// ---------------------------------------------------------------------------
// Postulaciones
// ---------------------------------------------------------------------------

/**
 * Wire: `VacancyApplicationStatus`. La transición NO retrocede (lo valida el
 * backend, `409` si se intenta). ⚠️ El valor terminal es `FINALIZADA`
 * (femenino, por "postulación") — no confundir con `VacancyStatus.FINALIZADO`.
 */
export type VacancyApplicationStatus = "PENDIENTE" | "VISTO" | "FINALIZADA";

/**
 * Wire: `VacancyApplicationResponse` — `{ vacancyApplicationId, vacancyId,
 * studentProfileId, status, appliedAt }`, confirmado en `docs/ENDPOINTS.md`.
 *
 * ⚠️ **`selected` SE ELIMINÓ.** Estaba en el MER aprobado (ver AGENTS.md —
 * "Postulaciones: máquina de estados") y A-17 lo daba como "confirmado por
 * backend, todavía no en api-dev", pero el contrato cerrado no lo incluye en
 * ningún lado: ni en esta response ni en `UpdateVacancyApplicationRequest`
 * (`{ status: VISTO | FINALIZADA }`, sin más campos). Se trata como una
 * reversión de esa confirmación previa, no como un olvido del documento — si
 * el backend lo reintroduce más adelante, revisar acá primero. Esto también
 * significa que no hay forma de distinguir "seleccionado" de "no
 * seleccionado" en una postulación `FINALIZADA` — ver
 * `features/postulaciones/components/application-progress.tsx`.
 */
export interface VacancyApplication {
  vacancyApplicationId: string;
  vacancyId: string;
  /** Apunta a `StudentProfile.studentProfileId`, NO a `User.userId`. */
  studentProfileId: string;
  status: VacancyApplicationStatus;
  appliedAt: string; // ISO 8601
}

// ---------------------------------------------------------------------------
// Payloads compartidos entre dominios
// ---------------------------------------------------------------------------

// Los inputs del paso 3 del registro (`POST /student-profile` / `POST /company`)
// los usan DOS dominios: `auth` (camino feliz, `use-register.ts`) y `perfil`
// (reintento desde `/completar-perfil`, `use-complete-profile.ts`). Por eso
// suben acá — un tipo que cruza dominios no puede vivir en `features/auth/types`
// sin romper la regla "no importar features/ de otro dominio". Ver AGENTS.md,
// "Registro en dos pasos y ProfileGuard".

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
