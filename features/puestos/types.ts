// Tipos del dominio: puestos (MER: `Vacancy`).
//
// La entidad `Vacancy` vive en @/types (la comparten moderacion y postulaciones).
// Acá va solo lo específico: filtros, orden e inputs de formulario.
//
// ⚠️ PROVISORIO: el contrato de la API todavía no está definido.

import type { Department, Modality, Vacancy, VacancyStatus } from "@/types";

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

// ---------------------------------------------------------------------------
// "Mis ofertas" (vista empresa) — RF-11/RF-12 desde el lado de la empresa.
// ---------------------------------------------------------------------------

/**
 * Orden de la tabla de ofertas de la empresa.
 *
 * `recent`/`oldest` se basan en `publishedAt`. El MER no tiene un
 * `Vacancy.createdAt`, así que una vacante en `pending` (nunca publicada) no
 * tiene fecha propia para ordenar — queda al final en `recent`.
 */
export type CompanyVacancyOrder = "recent" | "oldest" | "applicants";

/** Filtros de la tabla de "Mis ofertas". Hoy se resuelven en el cliente sobre
 *  fixtures — cuando exista el contrato de la API, probablemente viajen como
 *  query params de un GET paginado. */
export interface CompanyVacancyFilters {
  search?: string;
  status?: VacancyStatus;
  areaId?: string;
  location?: Department;
  order?: CompanyVacancyOrder;
  page?: number;
  perPage?: number;
}

/**
 * Fila de la tabla de "Mis ofertas": la `Vacancy` del MER más los datos
 * derivados que la pantalla necesita mostrar. No es una entidad del MER —
 * por eso vive acá y no en @/types.
 */
export interface CompanyVacancyRow extends Vacancy {
  areaName: string;
  applicantsCount: number;
  /** Postulaciones de los últimos 7 días. Alimenta el "+N esta semana". */
  newApplicantsThisWeek: number;
}
