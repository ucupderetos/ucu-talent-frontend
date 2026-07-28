"use client";

// Postulaciones del alumno logueado (vista "Mis postulaciones") — RF-POS.
//
// `GET /vacancy-application/me` (docs/ENDPOINTS.md, sección 6) ya devuelve
// vacancyName/companyName/status/vacancyStatus resueltos, pero no areaId ni
// contractType — se completan cruzando contra `GET /vacancy` (colección
// completa, sin paginar, sección 5) + `GET /area`, mismo patrón que el feed
// (`use-feed-vacancies.ts`).

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import type { MyApplicationRow } from "@/features/postulaciones/types";
import type { Area, Vacancy, VacancyApplication, VacancyApplicationStatus } from "@/types";

interface MyVacancyApplicationResponse {
  vacancyApplicationId: string;
  vacancyId: string;
  vacancyName: string;
  companyId: string;
  companyName: string;
  appliedAt: string;
  status: VacancyApplicationStatus;
  vacancyStatus: Vacancy["status"];
}

/**
 * @public para invalidación puntual futura (AGENTS.md). Misma queryKey que
 * usa `useHasApplied` (features/puestos/hooks/use-vacancy.ts) — deliberado,
 * ver el comentario ahí sobre por qué no es un import cruzado entre
 * `features/`.
 */
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
  const [applications, vacancies, areas] = await Promise.all([
    apiClient.get<MyVacancyApplicationResponse[]>("/vacancy-application/me"),
    apiClient.get<Vacancy[]>("/vacancy"),
    apiClient.get<Area[]>("/area"),
  ]);

  const rows = applications
    .map((item) => toRow(item, studentProfileId, vacancies, areas))
    .filter((row): row is MyApplicationRow => row != null);

  return sortByRecent(rows);
}

function toRow(
  item: MyVacancyApplicationResponse,
  studentProfileId: string,
  vacancies: Vacancy[],
  areas: Area[],
): MyApplicationRow | null {
  const vacancy = vacancies.find((v) => v.vacancyId === item.vacancyId);
  if (!vacancy) return null;

  const area = areas.find((a) => a.areaId === vacancy.areaId);

  const application: VacancyApplication = {
    vacancyApplicationId: item.vacancyApplicationId,
    vacancyId: item.vacancyId,
    studentProfileId,
    status: item.status,
    appliedAt: item.appliedAt,
  };

  return {
    application,
    vacancy,
    companyName: item.companyName,
    areaName: area?.name ?? "—",
  };
}

function sortByRecent(rows: MyApplicationRow[]): MyApplicationRow[] {
  return [...rows].sort(
    (a, b) =>
      new Date(b.application.appliedAt).getTime() - new Date(a.application.appliedAt).getTime(),
  );
}

/**
 * Opciones del select de carrera para el popover de filtros: solo las áreas
 * de vacantes a las que el alumno realmente se postuló (sin aplicar los
 * filtros activos), mismo criterio que `useFeedFilterOptions` en
 * `use-feed-vacancies.ts`. Se arma a partir de las filas ya resueltas (no
 * pide `GET /area` de nuevo) — el filtro solo necesita id + nombre.
 */
export function useMyApplicationAreas(
  rows: MyApplicationRow[] | undefined,
): Pick<Area, "areaId" | "name">[] {
  return useMemo(() => {
    if (!rows) return [];
    const seen = new Map<string, string>();
    for (const row of rows) {
      if (!seen.has(row.vacancy.areaId)) seen.set(row.vacancy.areaId, row.areaName);
    }
    return Array.from(seen, ([areaId, name]) => ({ areaId, name }));
  }, [rows]);
}
