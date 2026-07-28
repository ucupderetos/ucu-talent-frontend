// Tipos del dominio: puestos (MER/wire: `Vacancy`).
//
// La entidad `Vacancy` vive en @/types (la comparten moderacion y postulaciones).
// Acá va solo lo específico: filtros, orden e inputs de formulario.

import type { Company, Department, Modality, Vacancy, VacancyStatus } from "@/types";

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
 * La empresa no elige el estado inicial: la vacante nace `PUBLICADO`
 * (post-moderación, DEC-01) sin importar lo que se mande.
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
 * cliente sobre fixtures — ver `hooks/use-feed-vacancies.ts`. Por A-05
 * (✅ Resuelto), el filtrado queda en el front: no hay query params de
 * `GET /vacancy` que reemplacen esto, ni aunque exista paginación (A-04).
 * `areaIds`/`contractTypes`: multi-selección (RF-14 no pide exclusión mutua
 * entre carreras o tipos de contrato — un alumno puede cursar varias).
 */
export interface FeedFilters {
  search?: string;
  areaIds?: string[];
  contractTypes?: string[];
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
 * Detalle de una vacante (RF-PUE / vista alumno): la `Vacancy` del MER más la
 * `Company` dueña y los nombres de `Area` ya resueltos, para no repetir esos
 * `.find()` en el componente. No es una entidad del MER, por eso vive acá y
 * no en @/types.
 */
export interface VacancyDetail extends Vacancy {
  company: Company;
  areaName: string;
  /** Área padre de `areaName`, si la tiene (jerarquía de `Area`). `null` en
   *  áreas raíz. */
  parentAreaName: string | null;
}

/**
 * Cambio de estado hecho por la EMPRESA dueña de la vacante.
 *
 * La empresa dueña tiene UNA sola transición: cerrar la búsqueda,
 * `PUBLICADO → FINALIZADO` (RF-PUE-03). Retirar una vacante a `PENDIENTE` es
 * potestad exclusiva del Admin — ver la tabla de `VacancyStatus` en
 * `types/index.ts`. Tampoco hay "pausar": ese estado no existe en el enum.
 *
 * Se manda el objeto completo porque no hay endpoint chico de "solo cambiar
 * status": `PUT /vacancy/{id}` espera `CreateVacancyRequest` entero.
 *
 * 🔄 `api-dev` todavía expone solo `PENDIENTE | FINALIZADO` (A-14) y su
 * `PUT /vacancy/{id}` es rol `EMPRESA`; el endpoint de ADMIN para mover
 * estados no existe aún. Verificar al integrar.
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
 *  query params de un GET paginado.
 *  `statuses`/`areaIds`/`locations`: multi-selección, ver `vacancy-filters.tsx`.
 *  `publishedFrom`/`publishedTo`: rango sobre `Vacancy.publicationDate`
 *  (fechas `yyyy-MM-dd`, del `<input type="date">` de la barra de filtros).
 *  Una vacante sin `publicationDate` (todavía `PENDIENTE`) queda fuera de
 *  cualquier rango que se aplique. */
export interface CompanyVacancyFilters {
  search?: string;
  statuses?: VacancyStatus[];
  areaIds?: string[];
  locations?: Department[];
  publishedFrom?: string;
  publishedTo?: string;
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
