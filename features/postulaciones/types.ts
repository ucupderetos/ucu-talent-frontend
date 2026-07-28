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
 *  hoy en el cliente sobre fixtures (ver `hooks/use-company-applicants.ts`).
 *  `vacancyIds`/`statuses`: multi-selección. */
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
 * Wire: `VacancyApplicantResponse` (`GET /vacancy-application?vacancyId={id}`,
 * docs/ENDPOINTS.md sección 6) — `{ vacancyApplicationId, vacancyId,
 * studentProfileId, studentName, status, appliedAt }`, más el nombre de la
 * oferta (esta vista es cruzada a todas las ofertas de la empresa, no de una
 * vacante a la vez).
 *
 * ⚠️ Antes esta fila extendía `ApplicantListItem` (`StudentProfile` + `User`
 * completos) — el endpoint de LISTA ya resuelve `studentName` directo y no
 * trae `email` ni el resto del perfil, así que forzar el join completo por
 * fila era un mismatch contra el contrato real (habría exigido 1+N requests
 * en vez de uno). Sin `email` acá: no se puede mostrar ni buscar por email en
 * esta tabla — para eso está el detalle (`ApplicantDetailRow`).
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

/**
 * Cambio de estado de una postulación, hecho por la empresa.
 * Wire: `UpdateVacancyApplicationRequest` — `PUT /vacancy-application/{id}`.
 *
 * 🔴 GAP CONFIRMADO: el payload real SOLO tiene `status`. No existe ningún
 * campo para transmitir "seguir con el candidato o no" (lo que en el diseño
 * original de RF-21 se llamaba `continueWithCandidate`). Tal como está el
 * contrato hoy, el backend no tiene forma de saber qué mail mandarle al
 * postulante al pasar a `FINALIZADO` — o decide el contenido del mail solo en
 * base al `status`, o falta un campo que `docs/ENDPOINTS.md` todavía no
 * documenta. Confirmar con backend ANTES de construir la UI de "marcar
 * postulación como finalizada": si se asume un campo que no existe, la
 * request rompe con 400.
 */
export interface ApplicationStatusChange {
  status: VacancyApplicationStatus;
}
