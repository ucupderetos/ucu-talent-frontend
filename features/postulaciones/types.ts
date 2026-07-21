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
 * Fila de la lista de postulantes que ve la empresa.
 *
 * `profile` (`StudentProfile`) ya trae `name`/`surname` directo — a diferencia
 * de la asunción previa a tener el contrato, no hace falta combinarlo con
 * `user`. `user` (`GET /user/{studentProfileId}`) aporta lo que sí es de
 * `User`: `email` y `status` (para saber si el alumno está `APROBADO`).
 * TODO: confirmar si el backend expone esto ya agregado en un solo endpoint o
 * si de verdad hay que pedir `VacancyApplication` + `StudentProfile` + `User`
 * por separado (hoy, según `docs/ENDPOINTS.md`, son 3 requests).
 */
export interface ApplicantListItem {
  application: VacancyApplication;
  profile: StudentProfile;
  user: User;
}

/** Detalle del postulante: la empresa ve el CV completo del candidato. */
export interface ApplicantDetail extends ApplicantListItem {
  education: Education[];
  workExperience: WorkExperience[];
}

/** Fila de "mis postulaciones" que ve el alumno. */
export interface MyApplication {
  application: VacancyApplication;
  vacancy: Vacancy;
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
