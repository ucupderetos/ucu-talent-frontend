"use client";

// Postulaciones del alumno logueado (vista "Mis postulaciones") — RF-POS.
//
// ⚠️ ANDAMIO TEMPORAL, mismo patrón que use-feed-vacancies.ts: el contrato real
// (¿GET /vacancy-application?studentProfileId=...? — no está en ENDPOINTS.md
// todavía) no existe. Esto resuelve todo en memoria sobre lib/fixtures.ts.
//
// TODO(api): cuando exista el contrato, fetchMyApplications pasa a llamar
// apiClient.get<...>(...) y se borra la búsqueda en fixtures.

import { useQuery } from "@tanstack/react-query";

import { MOCK_AREAS, MOCK_APPLICATIONS, MOCK_COMPANIES, MOCK_VACANCIES } from "@/lib/fixtures";
import type { MyApplicationRow } from "@/features/postulaciones/types";
import type { VacancyApplication } from "@/types";

export function myApplicationsQueryKey(studentProfileId: string | undefined) {
  return ["postulaciones", "mias", studentProfileId] as const;
}

export function useMyApplications(studentProfileId: string | undefined) {
  return useQuery({
    queryKey: myApplicationsQueryKey(studentProfileId),
    queryFn: () => fetchMyApplications(studentProfileId as string),
    enabled: studentProfileId != null,
  });
}

async function fetchMyApplications(studentProfileId: string): Promise<MyApplicationRow[]> {
  const rows = MOCK_APPLICATIONS.filter((a) => a.studentProfileId === studentProfileId)
    .map(toRow)
    .filter((row): row is MyApplicationRow => row != null);

  return sortByRecent(rows);
}

function toRow(application: VacancyApplication): MyApplicationRow | null {
  const vacancy = MOCK_VACANCIES.find((v) => v.vacancyId === application.vacancyId);
  if (!vacancy) return null;

  const area = MOCK_AREAS.find((a) => a.areaId === vacancy.areaId);

  return {
    application,
    vacancy,
    companyName: MOCK_COMPANIES.find((c) => c.companyId === vacancy.companyId)?.name ?? "—",
    areaName: area?.name ?? "—",
  };
}

function sortByRecent(rows: MyApplicationRow[]): MyApplicationRow[] {
  return [...rows].sort(
    (a, b) =>
      new Date(b.application.appliedAt).getTime() - new Date(a.application.appliedAt).getTime(),
  );
}
