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

/**
 * RF-05/06/07 — import de LinkedIn.
 *
 * ⚠️ PENDIENTE DE ACLARAR: el formato se contradice en v3 — RF-05 dice
 * ZIP/CSV/PDF/txt y el flujo 6.2 dice PDF/DOCX. `docs/ENDPOINTS.md` no tiene
 * NINGÚN endpoint de import — ni de LinkedIn ni de archivos en general. Sigue
 * bajo prioridad Baja: no bloquea el MVP, pero confirmar con backend si esto
 * está en el roadmap antes de construir la UI.
 */
export type LinkedInImportFormat = "pendiente-de-confirmar";
// ---------------------------------------------------------------------------
// Empresa (MER/wire: `Company`)
// ---------------------------------------------------------------------------

/**
 * Perfil de empresa tal como lo edita ella misma. Espeja `Company` del MER.
 *
 * ⚠️ `docs/ENDPOINTS.md` todavía no expone `razonSocial`, `rut`, `phoneNumber`
 * ni `logoUrl` en `Company` — están en el MER pero no en el contrato real de
 * la API. Se documentan igual como forma deseada; `toCompanyProfile` rellena
 * los que faltan con datos mock hasta que el back los agregue.
 */
export interface CompanyProfile {
  /** Company.razon_social — nombrado en inglés (AGENTS.md), etiqueta visible
   *  sigue siendo "Razón social". */
  legalName: string;
  rut: string;
  phoneNumber: string;
  industry: string;
  description: string;
  webUrl: string;
  linkedinUrl: string;
  location: Department;
  /** Company.logo_url — bucket. Sin endpoint de upload todavía. */
  logoUrl: string;
}

/**
 * Wire: `UpdateCompanyRequest` — `PUT /company/{id}` (docs/ENDPOINTS.md,
 * sección 3). Es el SUBCONJUNTO de `CompanyProfile` que la API acepta: los
 * seis campos `@NotBlank`/`@NotNull` del contrato. `rut`, `phoneNumber` y
 * `logoUrl` del formulario NO viajan acá — el backend todavía no los expone,
 * viven solo en el view-model (ver `CompanyProfile` arriba).
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