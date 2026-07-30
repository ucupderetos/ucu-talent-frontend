"use client";

// Detalle completo de un postulante (el "CV" que ve la empresa): la fila +
// educación + experiencia laboral del alumno.
//
// A diferencia de la lista (`use-company-applicants.ts`), este hook NO
// depende de los filtros/paginación activos: la pantalla de detalle
// (`/postulantes/[id]`) es una página propia a la que se puede llegar por
// link directo o refresh, así que busca al postulante por id sin importar
// qué filtros haya aplicados en la lista.
//
// `GET /vacancy-application/{id}` (empresa dueña) no trae ni nombre ni email
// — hace falta `GET /vacancy/{id}` (ownership + nombre de la oferta),
// `GET /student-profile/{id}`, `GET /user/{id}` (email), `GET /education?
// studentProfileId=` y `GET /work-experience?studentProfileId=` (público)
// para completar la pantalla.

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import type { ApplicantDetailRow } from "@/features/postulaciones/types";
import type {
  Education,
  StudentProfile,
  User,
  Vacancy,
  VacancyApplication,
  WorkExperience,
} from "@/types";

/** @public para invalidación puntual futura (AGENTS.md). */
export function applicantDetailQueryKey(
  companyId: string | undefined,
  vacancyApplicationId: string | null,
) {
  return ["postulantes", "empresa", companyId, "detalle", vacancyApplicationId] as const;
}

export function useApplicantDetail(
  companyId: string | undefined,
  vacancyApplicationId: string | null,
) {
  return useQuery({
    queryKey: applicantDetailQueryKey(companyId, vacancyApplicationId),
    queryFn: ({ signal }) => fetchApplicantDetail(companyId, vacancyApplicationId, signal),
    enabled: Boolean(companyId && vacancyApplicationId),
  });
}

async function fetchApplicantDetail(
  companyId: string | undefined,
  vacancyApplicationId: string | null,
  signal?: AbortSignal,
): Promise<ApplicantDetailRow | null> {
  if (!companyId || !vacancyApplicationId) return null;

  const application = await fetchApplication(vacancyApplicationId, signal);
  if (!application) return null;

  const vacancy = await fetchVacancy(application.vacancyId, signal);
  // Ownership: solo la empresa dueña de la oferta puede ver este postulante.
  if (!vacancy || vacancy.companyId !== companyId) return null;

  const [profile, user, education, workExperience] = await Promise.all([
    apiClient.get<StudentProfile>(`/student-profile/${application.studentProfileId}`, { signal }),
    apiClient.get<User>(`/user/${application.studentProfileId}`, { signal }),
    apiClient.get<Education[]>("/education", {
      params: { studentProfileId: application.studentProfileId },
      signal,
    }),
    fetchWorkExperience(application.studentProfileId, signal),
  ]);

  return {
    application,
    profile,
    user,
    vacancyId: vacancy.vacancyId,
    vacancyName: vacancy.name,
    education,
    workExperience,
  };
}

async function fetchApplication(
  vacancyApplicationId: string,
  signal?: AbortSignal,
): Promise<VacancyApplication | null> {
  try {
    return await apiClient.get<VacancyApplication>(`/vacancy-application/${vacancyApplicationId}`, {
      signal,
    });
  } catch {
    return null;
  }
}

async function fetchVacancy(vacancyId: string, signal?: AbortSignal): Promise<Vacancy | null> {
  try {
    return await apiClient.get<Vacancy>(`/vacancy/${vacancyId}`, { signal });
  } catch {
    return null;
  }
}

async function fetchWorkExperience(
  studentProfileId: string,
  signal?: AbortSignal,
): Promise<WorkExperience[]> {
  try {
    return await apiClient.get<WorkExperience[]>("/work-experience", {
      params: { studentProfileId },
      signal,
    });
  } catch {
    // La experiencia laboral es auxiliar: no debería bloquear el detalle.
    return [];
  }
}
