// Tipos globales compartidos por toda la app.
//
// Acá viven las ENTIDADES CORE del modelo de datos: espejan las tablas del MER.
// Cruzan más de un dominio (ej. `Vacancy` la usan vacantes, moderación y
// postulaciones), y como la regla del equipo es "no importar desde features/ de
// otro dominio", suben acá.
//
// Lo específico de un dominio (filtros, payloads de formulario, view models) va
// en features/<x>/types.ts, no acá.
//
// Convención: identificadores en inglés espejando el MER, comentarios en español.
//
// ⚠️ PROVISORIO: alineado con el MER, pero el CONTRATO DE LA API todavía no está
// definido. Ver los TODO marcados: hay decisiones de serialización sin confirmar.

// ---------------------------------------------------------------------------
// Usuario y roles
// ---------------------------------------------------------------------------

/** MER: `User.role : enum(student, company, admin)`. */
export type Role = "student" | "company" | "admin";

/**
 * MER: `User.documentType : enum(cedula, DNI, Pasaporte)`.
 * ⚠️ El casing viene inconsistente del MER (minúscula + siglas + Capitalizado).
 * TODO: confirmar los literales exactos con backend.
 */
export type DocumentType = "cedula" | "DNI" | "Pasaporte";

/**
 * MER: `Vacancy.location` y `Company.location` son `enum(departamentos)`, pero el
 * MER no lista los valores.
 * TODO: pedir la lista exacta a backend. Hasta entonces, string.
 */
export type Department = string;

export interface User {
  id: string;
  /** El MER separa `name` y `surname`. Para empresas, `name` es el nombre de la
   *  empresa: `Company` no tiene campo propio de nombre. TODO: confirmar. */
  name: string;
  surname: string;
  email: string;
  role: Role;
  phoneNumber: string;
  documentType: DocumentType;
  documentNumber: string;
  linkedinUrl: string;
  registeredAt: string; // ISO 8601
}

// ---------------------------------------------------------------------------
// Áreas (taxonomía jerárquica)
// ---------------------------------------------------------------------------

/**
 * MER: `Area` clasifica TANTO `Degree` como `Vacancy`, y es jerárquica.
 *
 * Es el mecanismo del RF-14: ordenar el feed por coincidencia = matchear el área
 * de la carrera del alumno contra el área de la vacante. Matching por reglas, no
 * IA/ML — por eso no choca con "fuera de alcance".
 */
export interface Area {
  id: string;
  name: string;
  /** null en las áreas raíz. */
  parentAreaId: string | null;
}

// ---------------------------------------------------------------------------
// Empresa
// ---------------------------------------------------------------------------

export interface Company {
  id: string;
  userId: string;
  industry: string;
  description: string;
  webUrl: string;
  linkedinUrl: string;
  location: Department;
  /**
   * RF-13: la empresa necesita aprobación de Admin UCU antes de poder operar.
   *
   * ⚠️ Es un booleano, no un enum: **"rechazada" y "todavía no revisada" son el
   * mismo valor**. La cola de moderación no puede distinguirlas y una empresa
   * rechazada reaparece como pendiente. Deuda aceptada por el equipo; si más
   * adelante hace falta rechazo explícito, hay que migrar el campo.
   */
  approved: boolean;
}

// ---------------------------------------------------------------------------
// Perfil del alumno
// ---------------------------------------------------------------------------

/**
 * MER: `StudentProfile`. Ojo — es una entidad distinta de `User`, con su propio
 * id. `VacancyApplication` apuntan a `studentProfileId`, NO a `userId`.
 */
export interface StudentProfile {
  id: string;
  userId: string;
  /** MER: `skills : JSON`. TODO: confirmar la forma real con backend. */
  skills: string[];
}

export interface Degree {
  id: string;
  areaId: string;
  name: string;
  /** Distingue carreras de la UCU de las externas. */
  isUcu: boolean;
}

/** Un alumno puede tener N carreras — no hay un campo plano "carrera". */
export interface Education {
  id: string;
  studentProfileId: string;
  degreeId: string;
  description: string;
  startDate: string; // ISO 8601
  /** null si está en curso. */
  endDate: string | null;
}

export interface WorkExperience {
  id: string;
  studentProfileId: string;
  /** Texto libre: no es un FK a `Company`, puede ser cualquier empleador. */
  company: string;
  position: string;
  startDate: string; // ISO 8601
  /** null si es el trabajo actual. */
  endDate: string | null;
  description: string;
}

// ---------------------------------------------------------------------------
// Vacantes
// ---------------------------------------------------------------------------

export type Modality = "onsite" | "remote" | "hybrid";

/**
 * MER: `Vacancy.status : enum(pending, paused, published, rejected, closed)`.
 *
 * ⚠️ **`pending` existe**: la vacante NO se publica sola al crearse — Admin UCU
 * aprueba antes de que salga. El documento de requerimientos v3 dice lo contrario
 * y está desactualizado (confirmado por el equipo; falta actualizar el v3).
 */
export type VacancyStatus = "pending" | "paused" | "published" | "rejected" | "closed";

export interface Vacancy {
  id: string;
  companyId: string;
  areaId: string;
  /** El título del puesto. En el MER es `name`, no `title`. */
  name: string;
  description: string;
  requirements: string;
  contractType: string;
  modality: Modality;
  status: VacancyStatus;
  salaryRange: string;
  /** null mientras está en `pending`. */
  publishedAt: string | null; // ISO 8601
  closedAt: string | null; // ISO 8601
  location: Department;
}

// ---------------------------------------------------------------------------
// Postulaciones
// ---------------------------------------------------------------------------

/**
 * MER: `Vacancy_Application.status : enum(PENDIENTE, VISTO, FINALIZADO)`.
 *
 * ⚠️ Único enum en español y en MAYÚSCULAS de todo el modelo.
 * TODO: confirmar con backend si llega así en el JSON o si lo normalizan.
 *
 * No distingue "finalizado con avance" de "finalizado con rechazo": esa decisión
 * viaja aparte, en el payload del cambio de estado, y el backend se encarga del
 * mail. Ver features/postulaciones/types.ts.
 */
export type ApplicationStatus = "PENDIENTE" | "VISTO" | "FINALIZADO";

export interface VacancyApplication {
  id: string;
  vacancyId: string;
  /** Apunta a `StudentProfile.id`, NO a `User.id`. */
  studentProfileId: string;
  status: ApplicationStatus;
  appliedAt: string; // ISO 8601
}

// ---------------------------------------------------------------------------
// Utilidades de API
// ---------------------------------------------------------------------------

/** Respuesta paginada. TODO: la forma real depende del contrato del backend. */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
}
