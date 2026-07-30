// Tipos del dominio: perfil (MER/wire: `StudentProfile`, `Education`,
// `WorkExperience`).
//
// Las entidades core viven en @/types (la empresa ve el perfil de sus postulantes).
// Acá va lo específico: payloads de edición.

import type { DegreeLevel, Department, Education, StudentProfile, WorkExperience } from "@/types";

/**
 * Wire: `UpdateStudentProfileRequest` — `PUT /student-profile/{id}`
 * (docs/ENDPOINTS.md, sección 3). Reemplaza el objeto entero: SIEMPRE se
 * mandan los cuatro campos, aunque el usuario solo haya tocado uno (ver el
 * comentario en `use-update-student-profile.ts`).
 *
 * `name`/`surname`/documento NO están acá — el contrato dice explícitamente
 * que no se editan desde este endpoint.
 */
export interface UpdateStudentProfileInput {
  phoneNumber: string;
  linkedinUrl: string;
  skills: string[];
  description: string;
}

/**
 * Borrador compartido entre "Información personal" y "Habilidades" —
 * viven en pestañas separadas (decisión de UI), pero los cuatro campos son
 * UN solo recurso para el backend: `PUT /student-profile/{id}` los exige
 * todos no vacíos en cada request, así que cada pestaña necesita saber los
 * valores vigentes de la otra (aunque no se hayan guardado desde ahí) para
 * poder guardar. `StudentProfileView` es dueño de este estado y se lo pasa a
 * las dos pestañas junto con el setter — ver el comentario en
 * `student-profile-view.tsx`.
 */
export type StudentProfileDraft = UpdateStudentProfileInput;

/**
 * "Mi perfil" (vista alumno): el `StudentProfile` del MER más sus listas de
 * `Education`/`WorkExperience` — lo que arma `use-student-profile.ts` para
 * alimentar las pestañas de la pantalla. No es una entidad del MER, por eso
 * vive acá y no en `@/types`.
 */
export interface StudentProfileData {
  profile: StudentProfile;
  education: Education[];
  workExperience: WorkExperience[];
}

/**
 * OJO: no hay campo plano "carrera". Un alumno tiene N `Education`, cada una
 * con su `degreeLevel` (`TECNICATURA`/`LICENCIATURA`/`GRADO`/`POSGRADO`/
 * `DOCTORADO`) y apuntando a un `Degree`.
 */
export interface EducationInput {
  degreeLevel: DegreeLevel;
  degreeId: string;
  /** Obligatoria cuando `Degree.isUcu === false` (docs/ENDPOINTS.md, sección
   *  4) — el backend valida esto, el front solo replica el gate en el form. */
  institution?: string;
  description?: string;
  startDate: string; // ISO 8601
  /** null si está en curso. */
  endDate: string | null;
}

export interface WorkExperienceInput {
  company?: string;
  position?: string;
  startDate?: string; // ISO 8601
  /** null si es el trabajo actual. */
  endDate?: string | null;
  description?: string;
}

// ---------------------------------------------------------------------------
// Empresa (MER/wire: `Company`)
// ---------------------------------------------------------------------------

/**
 * Perfil de empresa tal como lo edita ella misma. Coincide con lo que la API
 * acepta/devuelve en `Company` (docs/ENDPOINTS.md, sección 3), con `name`
 * renombrado a `legalName` (inglés — AGENTS.md).
 *
 * La imagen de la empresa NO vive acá: va a `User.imageUrl` (compartida por
 * empresa/alumno/admin), todavía sin exponer en el contrato.
 */
export interface CompanyProfile {
  /** Company.name (razón social) — etiqueta visible "Razón social". */
  legalName: string;
  industry: string;
  description: string;
  webUrl: string;
  linkedinUrl: string;
  location: Department;
}

/**
 * Wire: `UpdateCompanyRequest` — `PUT /company/{id}` (docs/ENDPOINTS.md,
 * sección 3). Los seis campos `@NotBlank`/`@NotNull` del contrato: igual que
 * `CompanyProfile`, solo con `legalName` de vuelta como `name` (el nombre real
 * del campo en la API).
 */
export interface UpdateCompanyInput {
  /** Company.name (razón social) — el form lo llama `legalName`. */
  name: string;
  industry: string;
  description: string;
  webUrl: string;
  linkedinUrl: string;
  location: Department;
}

export const COMPANY_DESCRIPTION_MAX = 1000;

/** Límite de la "Descripción" en Formación académica y Experiencia laboral
 *  (Mi perfil, alumno) — no viene del backend (sin `@Size` documentado en
 *  ENDPOINTS.md), es un tope de UX para que el textarea no crezca sin
 *  límite. Mismo criterio que `COMPANY_DESCRIPTION_MAX`. */
export const PROFILE_ITEM_DESCRIPTION_MAX = 1000;