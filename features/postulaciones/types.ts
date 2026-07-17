// Tipos del dominio: postulaciones (MER: `Vacancy_Application`).
//
// Las entidades core viven en @/types. Acá va lo específico: view models de la
// gestión de postulantes y el payload del cambio de estado.
//
// ⚠️ PROVISORIO: el contrato de la API todavía no está definido.

import type {
  ApplicationStatus,
  Education,
  StudentProfile,
  User,
  Vacancy,
  VacancyApplication,
  WorkExperience,
} from "@/types";

/**
 * Fila de la lista de postulantes que ve la empresa.
 *
 * `StudentProfile` no trae nombre ni email (están en `User`), así que la vista
 * necesita las dos entidades.
 * TODO: confirmar si el backend devuelve esto ya agregado o si son 2 requests.
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
 *
 * 🔴 `continueWithCandidate` es lo que decide QUÉ MAIL manda el backend (RF-21).
 * El frontend NO arma ni dispara mails: solo transmite la decisión. Si este flag
 * va mal, al candidato le llega el mail equivocado — no es cosmético.
 *
 * Solo aplica cuando `status` pasa a `FINALIZADO`: el enum no distingue avance de
 * rechazo, por eso la decisión viaja en un campo aparte.
 *
 * TODO: confirmar con backend el NOMBRE EXACTO del campo y sus valores.
 * ¿`continueWithCandidate`? ¿`accepted`? ¿un enum en vez de booleano?
 */
export interface ApplicationStatusChange {
  status: ApplicationStatus;
  continueWithCandidate?: boolean;
}
