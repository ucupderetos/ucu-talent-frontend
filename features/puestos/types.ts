// Tipos del dominio: puestos (MER/wire: `Vacancy`).
//
// La entidad `Vacancy` vive en @/types (la comparten moderacion y postulaciones).
// Acá va solo lo específico: filtros, orden e inputs de formulario.

import type { Department, Modality, Vacancy, VacancyStatus } from "@/types";

/**
 * Orden del feed.
 *
 * `match` (RF-14) se resuelve por reglas: matchea el `Area` de las carreras del
 * alumno (Education → Degree → Area) contra el `Area` de la vacante. No es IA/ML,
 * así que no choca con "fuera de alcance".
 * TODO: confirmar si el backend expone ese orden (no está en `docs/ENDPOINTS.md`
 * — hoy el filtrado por `GET /vacancy` es solo por `status`/`companyId`/`areaId`/
 * `modality`/`location`) o si se calcula en el front con los datos ya traídos.
 */
export type FeedOrder = "recent" | "match";

/** Filtros del feed de vacantes (RF-14). Cada uno mapea 1:1 a un query param
 *  real de `GET /vacancy` (`docs/ENDPOINTS.md`, sección 10). */
export interface VacancyFilters {
  areaId?: string;
  modality?: Modality;
  location?: Department;
  status?: VacancyStatus;
  order?: FeedOrder;
}

/**
 * Payload para crear o editar una vacante. Wire: `CreateVacancyRequest` — lo
 * usan tanto `POST /vacancy` como `PUT /vacancy/{id}` (el PUT reemplaza el
 * objeto entero, no es un patch parcial).
 *
 * ⚠️ A diferencia de `StudentProfile`/`Company`/`Admin`, acá `companyId` NO se
 * ignora ni se deriva del token — el backend lo pide `@NotBlank` en el
 * payload. Hay que mandar el `companyId` de la empresa logueada explícitamente
 * (sale de `useSession()`, ya que `User.role === "EMPRESA"` implica que
 * `userId` = `companyId`).
 *
 * La empresa no elige el estado inicial: `POST /vacancy` fuerza `status` a
 * `PENDIENTE` sin importar lo que se mande.
 */
export interface VacancyInput {
  companyId: string;
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
 * Filtros del feed de vacantes (vista alumno) tal como se resuelven HOY en el
 * cliente sobre fixtures — ver `hooks/use-feed-vacancies.ts`. No confundir con
 * `VacancyFilters` de arriba: esos son los query params reales de
 * `GET /vacancy` para cuando exista el contrato de paginación (A-04/A-05).
 */
export interface FeedFilters {
  search?: string;
  areaId?: string;
  contractType?: string;
}

/**
 * Card de una vacante en el feed: la `Vacancy` del MER más los datos
 * derivados que la card necesita mostrar (nombre de empresa y de área). No es
 * una entidad del MER, por eso vive acá y no en `@/types`.
 */
export interface FeedVacancyRow extends Vacancy {
  companyName: string;
  areaName: string;
  /** Área padre de `areaName`, si la tiene (jerarquía de `Area`) — la card
   *  muestra ambas como tags. `null` en áreas raíz. */
  parentAreaName: string | null;
}

/**
 * Cambio de estado hecho por la EMPRESA dueña de la vacante.
 *
 * 🔴 GAP CONFIRMADO: `VacancyStatus` hoy solo tiene `PENDIENTE` y `FINALIZADO`
 * (ver el gap documentado en `types/index.ts` — falta `RECHAZADO`, y no hay
 * NINGÚN estado "publicado"). Esto significa que, tal como está el backend:
 *   - No existe un flujo de aprobación de Admin UCU que lleve a "publicado":
 *     ese endpoint no existe (`PUT /vacancy/{id}` es rol `EMPRESA`, no `ADMIN`).
 *   - La única transición que la empresa puede pedir es cerrar la vacante
 *     (`FINALIZADO`), reenviando el objeto completo (no hay un endpoint chico
 *     de "solo cambiar status" — `PUT` espera `CreateVacancyRequest` entero).
 *   - No hay "pausar": ese estado no existe en el enum real.
 * No inventar `published`/`paused`/`rejected` en el frontend hasta que el
 * backend los agregue (roadmap #3 de `docs/ENDPOINTS.md`). Confirmar con
 * backend antes de construir cualquier UI de moderación de vacantes.
 */
export interface CompanyVacancyStatusChange extends VacancyInput {
  status: Extract<VacancyStatus, "FINALIZADO">;
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
