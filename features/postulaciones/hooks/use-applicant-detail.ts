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
// ⚠️ ANDAMIO TEMPORAL sobre fixtures — ver use-company-applicants.ts.

import { useQuery } from "@tanstack/react-query";

import {
  MOCK_APPLICANT_USERS,
  MOCK_APPLICATIONS,
  MOCK_EDUCATION,
  MOCK_STUDENT_PROFILES,
  MOCK_VACANCIES,
  MOCK_WORK_EXPERIENCE,
} from "@/lib/fixtures";
import type { ApplicantDetailRow } from "@/features/postulaciones/types";

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
    queryFn: () => fetchApplicantDetail(companyId, vacancyApplicationId),
    enabled: Boolean(companyId && vacancyApplicationId),
  });
}

async function fetchApplicantDetail(
  companyId: string | undefined,
  vacancyApplicationId: string | null,
): Promise<ApplicantDetailRow | null> {
  if (!companyId || !vacancyApplicationId) return null;

  const application = MOCK_APPLICATIONS.find(
    (a) => a.vacancyApplicationId === vacancyApplicationId,
  );
  if (!application) return null;

  const vacancy = MOCK_VACANCIES.find((v) => v.vacancyId === application.vacancyId);
  // Ownership: solo la empresa dueña de la oferta puede ver este postulante.
  if (!vacancy || vacancy.companyId !== companyId) return null;

  const profile = MOCK_STUDENT_PROFILES.find(
    (p) => p.studentProfileId === application.studentProfileId,
  );
  const user = MOCK_APPLICANT_USERS.find((u) => u.userId === application.studentProfileId);
  if (!profile || !user) return null;

  return {
    application,
    profile,
    user,
    vacancyId: vacancy.vacancyId,
    vacancyName: vacancy.name,
    education: MOCK_EDUCATION.filter((e) => e.studentProfileId === profile.studentProfileId),
    workExperience: MOCK_WORK_EXPERIENCE.filter(
      (w) => w.studentProfileId === profile.studentProfileId,
    ),
  };
}
