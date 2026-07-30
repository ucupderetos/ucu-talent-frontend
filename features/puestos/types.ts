// Tipos del dominio: puestos (MER/wire: `Vacancy`).
//
// La entidad `Vacancy` vive en @/types (la comparten moderacion y postulaciones).
// Acá va solo lo específico: filtros, orden e inputs de formulario.

import type { Company, ContractType, Department, Modality, Vacancy, VacancyStatus } from "@/types";

/**
 * Payload para crear una vacante. Wire: `CreateVacancyRequest`
 * (`vacancy/dto/CreateVacancyRequest.java`, verificado contra el código
 * fuente del backend — ninguna versión de `docs/ENDPOINTS.md` documentaba
 * `publicationDate`/`closingDate` como input obligatorio, ni que el campo de
 * sueldo acá se llama `salary`, no `salaryRange`).
 *
 * ⚠️ A diferencia de `StudentProfile`/`Company`/`Admin`, acá `companyId` NO se
 * ignora ni se deriva del token — el backend lo pide `@NotBlank` en el
 * payload. Hay que mandar el `companyId` de la empresa logueada explícitamente
 * (sale de `useSession()`, ya que `User.role === "EMPRESA"` implica que
 * `userId` = `companyId`).
 *
 * ⚠️ **`publicationDate`/`closingDate` son obligatorias, no autogeneradas.**
 * La empresa las elige en el form; el backend valida que `publicationDate`
 * no sea anterior a hoy, que `closingDate` no sea anterior a `publicationDate`,
 * y que no pase más de un año entre las dos. `closingDate` además dispara el
 * auto-cierre por cron el día que se cumple — ver el aviso en `Vacancy`,
 * `@/types`.
 *
 * La empresa no elige el estado inicial: la vacante nace `PUBLICADO`
 * (post-moderación, DEC-01) sin importar lo que se mande.
 *
 * `UpdateVacancyRequest` (el `PUT /vacancy/{id}`) es un shape DISTINTO — sin
 * `companyId`/`areaId` (no se reasignan), pero el campo de sueldo se llama
 * `salary` en los dos DTOs (`Create`/`Update`) — ver el aviso en
 * `VacancyUpdateInput` sobre la corrección 2026-07-30.
 */
export interface VacancyInput {
  companyId: string;
  name: string;
  description: string;
  requirements: string;
  areaId: string;
  contractType: ContractType;
  modality: Modality;
  salary: string;
  location: Department;
  /** `YYYY-MM-DD`, del `<input type="date">` del form. */
  publicationDate: string;
  /** `YYYY-MM-DD`, del `<input type="date">` del form. */
  closingDate: string;
}

/**
 * Payload para editar una vacante ya existente. Wire: `UpdateVacancyRequest`
 * (`PUT /vacancy/{id}`, docs/ENDPOINTS.md) — a diferencia de `VacancyInput`
 * (`POST /vacancy` / `CreateVacancyRequest`), NO lleva `companyId` ni
 * `areaId`: el backend ya sabe de qué vacante se trata por el `{id}` de la
 * URL, y el área queda fija desde la creación (el contrato no la deja
 * editar).
 *
 * ⚠️ **NO se deriva de `VacancyInput` con `Omit`** — no es cuestión de un
 * simple `Omit` de `companyId`/`areaId`: es un DTO de update parcial
 * (`UpdateVacancyRequest`), conceptualmente distinto del de creación aunque
 * hoy comparta casi todos los nombres de campo. Por eso es una interface
 * explícita.
 *
 * A-06 (qué se puede editar) — resuelto por el BACKEND, no es decisión de
 * front: `PUT /vacancy/{id}` (`VacancyServiceImpl.updateVacancy`, rama `dev`)
 * rechaza la edición entera con `403` si la vacante tiene aunque sea una
 * postulación (`"El Puesto ya tiene postulaciones."`) o ya está `FINALIZADO`
 * (`"El Puesto ya finalizó."`). El front espeja ese gate como UX:
 * - `FINALIZADO`: no editable en absoluto (`EditVacancyView` bloquea antes
 *   de montar el form).
 * - Con >=1 postulaciones: el form entero pasa a solo lectura, con la
 *   explicación en pantalla (`EditJobForm.isLocked`) — mismo bloqueo que el
 *   backend, para no dejar completar un form que se comería el 403.
 * - Sin postulaciones y no `FINALIZADO`: todo lo que este tipo permite queda
 *   editable.
 */
export interface VacancyUpdateInput {
  name: string;
  description: string;
  requirements: string;
  contractType: ContractType;
  modality: Modality;
  /** Mismo campo `salary` que `VacancyInput` y que `Vacancy.salary` de
   *  lectura — verificado 2026-07-30 contra `UpdateVacancyRequest.java`
   *  (rama `dev`): no hay `salaryRange`, esa traducción vieja era un bug
   *  (corregido en `use-edit-job.ts`, ver AGENTS.md A-15). */
  salary: string;
  location: Department;
  /** `YYYY-MM-DD`. Read-only en el form de edición: se reenvía el valor previo
   *  de la vacante (no se mueve la fecha de publicación de algo ya publicado). */
  publicationDate: string;
  /** `YYYY-MM-DD`. Editable: extender/acortar la búsqueda (dispara el auto-cierre
   *  por cron cuando se cumple — ver `Vacancy`, `@/types`). */
  closingDate: string;
}

/**
 * Filtros del feed de vacantes (vista alumno) tal como se resuelven HOY en el
 * cliente sobre los datos ya traídos de `GET /vacancy` — ver
 * `hooks/use-feed-vacancies.ts`. Por A-05 (✅ Resuelto), el filtrado queda en
 * el front: no hay query params de `GET /vacancy` que reemplacen esto, ni
 * aunque exista paginación (A-04).
 * `areaIds`/`contractTypes`: multi-selección (RF-14 no pide exclusión mutua
 * entre carreras o tipos de contrato — un alumno puede cursar varias).
 */
export interface FeedFilters {
  search?: string;
  areaIds?: string[];
  contractTypes?: ContractType[];
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
 * Cambio de estado hecho por la EMPRESA dueña de la vacante — cierre de la
 * búsqueda.
 *
 * La empresa dueña SOLO cierra desde `PUBLICADO` → `FINALIZADO` (terminal,
 * RF-PUE-03). ⚠️ NO puede cerrar desde `PENDIENTE`: mientras el Admin la
 * tiene en revisión, `VacancyServiceImpl.updateVacancyStatus` (fuente del
 * backend) lo prohíbe con `403 "El Puesto está en revisión."`. Retirar una
 * vacante a `PENDIENTE` es potestad exclusiva del Admin — ver la tabla de
 * `VacancyStatus` en `types/index.ts`. Tampoco hay "pausar": ese estado no
 * existe en el enum.
 *
 * ✅ Resuelto (A-14, `docs/ENDPOINTS.md`) — corrige lo que decía antes este
 * párrafo (que no había endpoint chico de status y había que mandar el
 * objeto completo). Hay dos endpoints dedicados a status, separados de
 * `PUT /vacancy/{id}` (que edita el resto de los campos):
 * `PATCH /vacancy/status/{id}` (EMPRESA + dueña) y `PUT /vacancy/status/{id}`
 * (ADMIN, `PUBLICADO ↔ PENDIENTE`). El contrato no detalla el shape exacto de
 * `UpdateVacancyStatusRequest` más allá del endpoint — se asume `{ status }`
 * por ser el mínimo que el nombre sugiere; confirmar al conectar.
 *
 * ⚠️ Sin consumidores hoy — quedó del diseño previo (que sí se usaba con el
 * objeto completo). El shape de acá abajo ya es el corregido.
 */
export interface CompanyVacancyStatusChange {
  status: Extract<VacancyStatus, "FINALIZADO">;
}

// ---------------------------------------------------------------------------
// "Mis ofertas" (vista empresa) — RF-11/RF-12 desde el lado de la empresa.
// ---------------------------------------------------------------------------

/**
 * Orden de la tabla de ofertas de la empresa.
 *
 * `recent`/`oldest` se basan en `publicationDate` — obligatoria y siempre
 * seteada (la define la empresa al crear, no el backend al aprobar; `Vacancy`
 * sí tiene `createdAt` en el wire real, pero `publicationDate` es la fecha de
 * negocio: "cuándo entra al feed", que puede diferir de cuándo se creó el
 * registro).
 */
export type CompanyVacancyOrder = "recent" | "oldest" | "applicants";

/** Filtros de la tabla de "Mis ofertas". Hoy se resuelven en el cliente sobre
 *  los datos ya traídos de `GET /vacancy` (A-05) — cuando exista un contrato
 *  de filtros del backend, probablemente viajen como query params de un GET
 *  paginado.
 *  `statuses`/`areaIds`/`locations`: multi-selección, ver `vacancy-filters.tsx`.
 *  `publishedFrom`/`publishedTo`: rango sobre `Vacancy.publicationDate`
 *  (fechas `yyyy-MM-dd`, del `<input type="date">` de la barra de filtros). */
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
 *
 * ⚠️ **2026-07-30: pasó a alimentarse de `GET
 * /vacancy/company/{companyId}/management`** (`VacancyManagementResponse`,
 * verificado contra el código fuente del backend — no documentado en
 * ninguna versión de `ENDPOINTS.md`), no de `GET /vacancy` + un fetch de
 * postulaciones por vacante. El endpoint ya devuelve `companyName`/
 * `areaName`/`applicationCount`/`newApplicationsCount` calculados del lado
 * del servidor (y ya filtra `deleted = false` — `VacancyRepository.
 * findManagementByCompanyId`), así que se elimina el N+1 de
 * `use-company-vacancies.ts` por completo.
 */
export interface CompanyVacancyRow extends Vacancy {
  areaName: string;
  applicantsCount: number;
  /** Siempre `true` desde el cambio al endpoint agregado: el conteo viene
   *  en la MISMA respuesta que la fila (no hay un fetch aparte por vacante
   *  que pueda fallar de forma independiente). Se mantiene el campo para no
   *  tocar el gate de edición de A-06 en `vacancy-table.tsx`, que sigue
   *  siendo válido si en el futuro alguna fuente parcial vuelve a fallar. */
  applicantsCountKnown: boolean;
  /** Postulaciones en estado `PENDIENTE` (sin revisar por la empresa),
   *  `VacancyManagementResponse.newApplicationsCount`. Reemplaza al criterio
   *  anterior ("postulado en los últimos 7 días", que exigía el `appliedAt`
   *  de cada postulación) — decisión del equipo 2026-07-30: este criterio
   *  es el que ya calcula el backend y no depende de la fecha, solo del
   *  estado PENDIENTE→VISTO de la máquina de postulaciones. */
  unreviewedApplicantsCount: number;
}
