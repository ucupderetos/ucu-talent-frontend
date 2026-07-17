// Tipos del dominio: perfil.
//
// `PerfilAlumno` vive en @/types (la empresa ve el perfil de sus postulantes).
// Acá va lo específico: el payload de edición y el import de LinkedIn.
//
// ⚠️ PROVISORIO: el contrato de la API todavía no está definido.

/** Payload de edición del perfil propio del alumno. */
export interface PerfilInput {
  nombre: string;
  carrera: string;
  skills: string[];
}

/**
 * RF-05/06/07 — import de LinkedIn.
 *
 * ⚠️ PENDIENTE DE ACLARAR: el formato se contradice en el documento v3 — RF-05
 * dice ZIP/CSV/PDF/txt y el flujo 6.2 dice PDF/DOCX. Confirmar qué soporta
 * realmente el backend antes de tipar esto en serio.
 *
 * Bajó de prioridad Alta a Baja: no bloquea el MVP.
 */
export type FormatoImportLinkedIn = "pendiente-de-confirmar";
