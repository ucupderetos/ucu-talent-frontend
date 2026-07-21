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
   * `features/auth/hooks/use-session.ts` con una segunda consulta al perfil
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
 * `userId`) ni un campo de aprobación — la aprobación vive en
 * `User.status` (`AccountStatus`), no acá. Para saber si una empresa está
 * aprobada hay que pedir su `User` (`GET /user/{companyId}`) y mirar `status`.
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
 * Wire: `VacancyStatus`.
 *
 * 🔴 GAP CONFIRMADO EN `docs/ENDPOINTS.md` (roadmap #3): el backend hoy SOLO
 * tiene estos dos valores. No existe `RECHAZADO`, ni ningún estado
 * "publicado"/"pausado" — la vacante nace `PENDIENTE` y el único otro estado
 * es `FINALIZADO`. Esto contradice el flujo de moderación que se había
 * documentado (Admin aprueba → `published`): tal como está el backend hoy,
 * **no hay forma de que una vacante pase a un estado "visible/publicado"**.
 * No inventar esos estados en el frontend — están fuera del contrato real
 * hasta que el backend los agregue. Ver también el gap de moderación en
 * `AccountStatus` de más arriba.
 */
export type VacancyStatus = "PENDIENTE" | "FINALIZADO";

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
  publicationDate: string | null; // ISO 8601
  closingDate: string | null; // ISO 8601
}

// ---------------------------------------------------------------------------
// Postulaciones
// ---------------------------------------------------------------------------

/**
 * Wire: `VacancyApplicationStatus`. La transición NO retrocede (lo valida el
 * backend, `409` si se intenta). Sigue sin distinguir "finalizado con avance"
 * de "finalizado con rechazo" — ver `features/postulaciones/types.ts` para el
 * gap de cómo (o si) esa decisión viaja hoy al backend para el mail de RF-21.
 */
export type VacancyApplicationStatus = "PENDIENTE" | "VISTO" | "FINALIZADO";

/** Wire: `VacancyApplicationResponse`. */
export interface VacancyApplication {
  vacancyApplicationId: string;
  vacancyId: string;
  /** Apunta a `StudentProfile.studentProfileId`, NO a `User.userId`. */
  studentProfileId: string;
  status: VacancyApplicationStatus;
  appliedAt: string; // ISO 8601
}
