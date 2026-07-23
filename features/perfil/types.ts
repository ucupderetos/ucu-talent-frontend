// Tipos del dominio: perfil (MER/wire: `StudentProfile`, `Education`,
// `WorkExperience`).
//
// Las entidades core viven en @/types (la empresa ve el perfil de sus postulantes).
// Acá va lo específico: payloads de edición.
//
// 🔴 GAP CONFIRMADO: `docs/ENDPOINTS.md` dice explícitamente "No hay PUT de
// update para StudentProfile todavía" (sección 2). Los tipos de abajo
// (`StudentProfileInput`, `PersonalDataInput`) no tienen hoy ningún endpoint
// al que pegarle — quedan documentados como contrato deseado. Confirmar con
// backend antes de construir la pantalla de "editar perfil".

import type { Company, DegreeLevel, Department } from "@/types";
/**
 * Perfil completo del alumno tal como lo editaría él mismo — nombre, apellido,
 * documento, teléfono, LinkedIn y skills viven TODOS en `StudentProfile`
 * ahora (no en `User`, que quedó como identidad pura tras el refactor del
 * backend). Sin `PUT /student-profile`, no hay forma de mandar esto todavía.
 */
export interface StudentProfileInput {
  name: string;
  surname: string;
  phoneNumber?: string;
  linkedinUrl?: string;
  skills: string[];
}

/**
 * OJO: no hay campo plano "carrera". Un alumno tiene N `Education`, cada una
 * con su `degreeLevel` (`TECNICATURA`/`LICENCIATURA`/`GRADO`/`POSGRADO`/
 * `DOCTORADO`) y apuntando a un `Degree`.
 */
export interface EducationInput {
  degreeLevel: DegreeLevel;
  degreeId: string;
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
 * Payload de edición de `Company`. Es un subconjunto de la entidad completa
 * (sin `companyId`, que no se reasigna, y sin `status`/`reviewedAt`/
 * `adminComment`, que los pone el Admin, no la empresa) — coincide 1:1 con
 * `UpdateCompanyRequest` de docs/ENDPOINTS.md.
 *
 * ⚠️ El MER tenía razonSocial/rut/phoneNumber/logoUrl, pero ENDPOINTS.md
 * (fuente #3, gana sobre el MER) no los expone en `Company` — se sacaron del
 * formulario. Ver AGENTS.md → "Las tres fuentes y su orden de precedencia".
 */
export type CompanyProfileInput = Omit<Company, "companyId">;

export const COMPANY_DESCRIPTION_MAX = 1000;