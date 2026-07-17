// Tipos del dominio: perfil (MER: `StudentProfile`, `Education`, `WorkExperience`).
//
// Las entidades core viven en @/types (la empresa ve el perfil de sus postulantes).
// Acá va lo específico: payloads de edición.
//
// ⚠️ PROVISORIO: el contrato de la API todavía no está definido.

/**
 * Perfil completo del alumno tal como lo edita él mismo.
 *
 * OJO: no hay campo plano "carrera". Un alumno tiene N `Education`, cada una
 * apuntando a un `Degree`.
 */
export interface StudentProfileInput {
  /** MER: `skills : JSON`. TODO: confirmar la forma real. */
  skills: string[];
}

export interface EducationInput {
  degreeId: string;
  description: string;
  startDate: string; // ISO 8601
  /** null si está en curso. */
  endDate: string | null;
}

export interface WorkExperienceInput {
  company: string;
  position: string;
  startDate: string; // ISO 8601
  /** null si es el trabajo actual. */
  endDate: string | null;
  description: string;
}

/** Datos personales que vive en `User`, no en `StudentProfile`. */
export interface PersonalDataInput {
  name: string;
  surname: string;
  phoneNumber: string;
  linkedinUrl: string;
}

/**
 * RF-05/06/07 — import de LinkedIn.
 *
 * ⚠️ PENDIENTE DE ACLARAR: el formato se contradice en v3 — RF-05 dice
 * ZIP/CSV/PDF/txt y el flujo 6.2 dice PDF/DOCX. El MER no tiene tabla de archivos
 * importados, solo `User.linkedinUrl`, lo que sugiere un alcance liviano.
 * Confirmar con backend qué soporta realmente.
 *
 * Bajó de prioridad Alta a Baja: no bloquea el MVP.
 */
export type LinkedInImportFormat = "pendiente-de-confirmar";
