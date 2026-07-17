// Tipos del dominio: moderacion (Admin UCU).
//
// Las entidades core viven en @/types. Acá van las acciones de moderación.
//
// ⚠️ PROVISORIO: el contrato de la API todavía no está definido.

/**
 * RF-13: aprobar una empresa. El gate es sobre la EMPRESA, no sobre cada vacante.
 *
 * ⚠️ `Company.approved` es un BOOLEANO: no hay forma de registrar un rechazo.
 * Rechazar = dejarlo en false = indistinguible de "todavía no revisada". Por eso
 * acá no hay `reject`: no existe tal acción en el modelo actual.
 *
 * Deuda aceptada por el equipo. Si más adelante hace falta rechazo explícito, hay
 * que migrar el campo a enum y agregar la acción.
 */
export interface CompanyApproval {
  companyId: string;
  approved: boolean;
}

/**
 * RF-12: resolver una vacante en `pending`.
 *
 * ⚠️ CAMBIO DE FLUJO respecto de lo que decía el documento v3: la vacante NO se
 * publica sola al crearse. Nace en `pending` y Admin UCU aprueba (`published`) o
 * rechaza (`rejected`) ANTES de que salga. (Confirmado por el equipo; falta
 * actualizar el v3.)
 *
 * TODO: confirmar si Admin puede además despublicar una `published` ya viva, y a
 * qué estado la manda.
 */
export interface VacancyResolution {
  vacancyId: string;
  decision: "approve" | "reject";
  /** TODO: confirmar si el backend guarda un motivo de rechazo — el MER no tiene
   *  campo para esto en `Vacancy`. */
  reason?: string;
}

/** Las dos colas del panel de Admin UCU. */
export type ModerationQueue = "pending-companies" | "pending-vacancies";
