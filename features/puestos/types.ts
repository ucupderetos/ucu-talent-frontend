// Tipos del dominio: puestos (MER: `Vacancy`).
//
// La entidad `Vacancy` vive en @/types (la comparten moderacion y postulaciones).
// Acá va solo lo específico: filtros, orden e inputs de formulario.
//
// ⚠️ PROVISORIO: el contrato de la API todavía no está definido.

import type { Department, Modality, VacancyStatus } from "@/types";

/**
 * Orden del feed.
 *
 * `match` (RF-14) se resuelve por reglas: matchea el `Area` de las carreras del
 * alumno (Education → Degree → Area) contra el `Area` de la vacante. No es IA/ML,
 * así que no choca con "fuera de alcance".
 * TODO: confirmar si el backend expone ese orden o si se calcula en el front.
 */
export type FeedOrder = "recent" | "match";

/** Filtros del feed de vacantes (RF-14). */
export interface VacancyFilters {
  search?: string;
  areaId?: string;
  modality?: Modality;
  location?: Department;
  order?: FeedOrder;
}

/**
 * Payload para crear o editar una vacante.
 *
 * La empresa no elige el estado: al crearse queda en `pending` hasta que Admin
 * UCU la apruebe.
 */
export interface VacancyInput {
  name: string;
  description: string;
  requirements: string;
  areaId: string;
  contractType: string;
  modality: Modality;
  salaryRange: string;
  location: Department;
}

/**
 * Cambio de estado hecho por la EMPRESA dueña de la vacante.
 *
 * `published` y `rejected` son de Admin UCU, no de la empresa — ver
 * features/moderacion/types.ts.
 *
 * TODO: confirmar si despausar devuelve a `published` directo o si vuelve a
 * pasar por `pending` (o sea, si requiere re-aprobación).
 */
export interface CompanyVacancyStatusChange {
  status: Extract<VacancyStatus, "paused" | "published" | "closed">;
}
