// Tipos del dominio: postulaciones (MER/wire: `VacancyApplication`).
//
// Las entidades core viven en @/types. Acá va lo específico: view models de la
// gestión de postulantes y el payload del cambio de estado.

import type {
  Education,
  StudentProfile,
  User,
  Vacancy,
  VacancyApplication,
  VacancyApplicationStatus,
  WorkExperience,
} from "@/types";

/**
 * Detalle del postulante: la empresa ve el CV completo del candidato.
 *
 * A diferencia de la fila de lista (`ApplicantRow`, más abajo), el detalle SÍ
 * necesita `StudentProfile` y `User` completos — `GET /vacancy-application/{id}`
 * devuelve `VacancyApplicationResponse` (`{ vacancyApplicationId, vacancyId,
 * studentProfileId, status, appliedAt }`, docs/ENDPOINTS.md sección 6), que no
 * trae ni nombre ni email. Hacen falta requests separados a
 * `GET /student-profile/{id}` y `GET /user/{id}` para completar la pantalla.
 */
interface ApplicantDetail {
  application: VacancyApplication;
  profile: StudentProfile;
  user: User;
  education: Education[];
  workExperience: WorkExperience[];
}

/** Fila de "mis postulaciones" que ve el alumno. */
interface MyApplication {
  application: VacancyApplication;
  vacancy: Vacancy;
}

// ---------------------------------------------------------------------------
// "Postulantes" (vista empresa) — RF-POS desde el lado de la empresa.
// ---------------------------------------------------------------------------

/** Orden de la lista de postulantes, por fecha de postulación (`appliedAt`). */
export type ApplicantOrder = "recent" | "oldest";

/** Filtros de la tabla de "Postulantes". Igual que en `puestos`, se resuelven
 *  en el cliente sobre los datos ya juntados desde la API (ver
 *  `hooks/use-company-applicants.ts`). `vacancyIds`/`statuses`: multi-selección. */
export interface ApplicantFilters {
  search?: string;
  vacancyIds?: string[];
  statuses?: VacancyApplicationStatus[];
  order?: ApplicantOrder;
  page?: number;
  perPage?: number;
}

/**
 * Fila de la tabla de "Postulantes".
 *
 * ⚠️ **`VacancyApplicantResponse` (con `studentName` resuelto) NO EXISTE en
 * el backend real — corrige la versión anterior de este comentario.** Las dos
 * copias de `ENDPOINTS.md` (la local y la del propio repo de backend) lo
 * documentaban así, pero `VacancyApplicationController.getByVacancyId`
 * (fuente del backend, `GET /vacancy-application?vacancyId={id}`) devuelve
 * `List<VacancyApplicationResponse>` — el mismo shape que todos los demás
 * endpoints de postulaciones: `{ vacancyApplicationId, vacancyId,
 * studentProfileId, status, appliedAt, accepted }`, **sin `studentName`**.
 * Para mostrar el nombre hace falta resolver `StudentProfile` por
 * `studentProfileId` — 1+N requests vía `GET /student-profile/{id}`, mismo
 * patrón que `use-my-applications.ts` con `Company`/`Area`. Así lo resuelve
 * `use-company-applicants.ts`. El nombre de la oferta (`vacancyName`)
 * tampoco viene en la response — esta vista es cruzada a todas las ofertas de
 * la empresa, así que también se resuelve por `vacancyId` (contra las
 * vacantes propias, ya traídas para armar la lista).
 *
 * ⚠️ Antes de esto, esta fila extendía `ApplicantListItem` (`StudentProfile` +
 * `User` completos) — sin `email` en este nivel: no se puede mostrar ni
 * buscar por email en esta tabla, para eso está el detalle (`ApplicantDetailRow`).
 */
export interface ApplicantRow {
  application: VacancyApplication;
  studentName: string;
  vacancyId: string;
  vacancyName: string;
}

/** Igual que `ApplicantRow`, pero con el detalle completo (CV) — para la
 *  página de detalle (`/postulantes/[id]`) a la que se navega al seleccionar
 *  un postulante (ver `applicant-detail-view.tsx`). */
export interface ApplicantDetailRow extends ApplicantDetail {
  vacancyId: string;
  vacancyName: string;
}

/**
 * Fila de "mis postulaciones" con los datos derivados que la card necesita
 * mostrar (nombre de empresa y de área) ya resueltos — mismo criterio que
 * `FeedVacancyRow` en `features/puestos/types.ts`.
 */
export interface MyApplicationRow extends MyApplication {
  companyName: string;
  areaName: string;
}

/** Filtros de la barra de "Mis postulaciones" (vista alumno): búsqueda +
 *  estado + carrera. Resuelto en memoria sobre `MyApplicationRow[]`, mismo
 *  criterio que `FeedFilters` en `features/puestos/types.ts`. */
export interface MyApplicationFilters {
  search?: string;
  statuses?: VacancyApplicationStatus[];
  areaIds?: string[];
}
