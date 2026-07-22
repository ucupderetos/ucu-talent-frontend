"use client";

// Detalle de una vacante (vista alumno) — RF-PUE.
//
// ⚠️ ANDAMIO TEMPORAL: el contrato de la API todavía no está definido (ver
// AGENTS.md). Esto simula un `GET /vacancy/:id` que además resuelve la
// `Company` (`GET /company/:id`) y el `Area` (`GET /area/:id`) dueños de la
// vacante, resolviendo todo en memoria sobre `lib/fixtures.ts`.
//
// TODO(api): cuando el contrato exista, `fetchVacancy` pasa a encadenar esas
// tres llamadas reales (o a un único endpoint si el backend lo agrega) y se
// borra la búsqueda en fixtures.

import { useQuery } from "@tanstack/react-query";

import { MOCK_APPLICATIONS, MOCK_AREAS, MOCK_COMPANIES, MOCK_VACANCIES } from "@/lib/fixtures";
import type { VacancyDetail } from "@/features/puestos/types";

export function vacancyQueryKey(vacancyId: string) {
  return ["puestos", vacancyId] as const;
}

export function useVacancy(vacancyId: string) {
  return useQuery({
    queryKey: vacancyQueryKey(vacancyId),
    queryFn: () => fetchVacancy(vacancyId),
  });
}

async function fetchVacancy(vacancyId: string): Promise<VacancyDetail | null> {
  const vacancy = MOCK_VACANCIES.find((v) => v.vacancyId === vacancyId);
  if (!vacancy) return null;

  const company = MOCK_COMPANIES.find((c) => c.companyId === vacancy.companyId);
  if (!company) return null;

  const area = MOCK_AREAS.find((a) => a.areaId === vacancy.areaId);
  const parentArea = area?.parentAreaId
    ? MOCK_AREAS.find((a) => a.areaId === area.parentAreaId)
    : undefined;

  return {
    ...vacancy,
    company,
    areaName: area?.name ?? "—",
    parentAreaName: parentArea?.name ?? null,
  };
}

/**
 * RN-05: un alumno no puede postularse dos veces a la misma vacante. Se
 * resuelve en el cliente sobre `MOCK_APPLICATIONS` mientras no exista el
 * contrato — es una lectura síncrona sobre datos ya cargados, no una request
 * propia, por eso no es un `useQuery` aparte.
 */
export function hasAppliedToVacancy(
  vacancyId: string,
  studentProfileId: string | undefined,
): boolean {
  if (!studentProfileId) return false;
  return MOCK_APPLICATIONS.some(
    (a) => a.vacancyId === vacancyId && a.studentProfileId === studentProfileId,
  );
}
