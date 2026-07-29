"use client";

// Postulaciones del alumno logueado (vista "Mis postulaciones") — RF-POS.
//
// ⚠️ `GET /vacancy-application/me` NO devuelve vacancyName/companyName/
// vacancyStatus resueltos — corrige una versión anterior de este comentario,
// escrita contra docs/ENDPOINTS.md (que sí los prometía). Verificado contra
// el código fuente real del backend
// (`vacancyapplication/dto/VacancyApplicationStudentResponse.java`): el wire
// es `{ vacancyApplicationId, vacancyId, studentProfileId, status, appliedAt }`,
// nada más. Se completa cruzando contra `GET /vacancy` (colección completa,
// sin paginar, sección 5) + `GET /company` + `GET /area`, mismo patrón que el
// feed (`use-feed-vacancies.ts`).

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import type { MyApplicationRow } from "@/features/postulaciones/types";
import type { Area, Company, Vacancy, VacancyApplication, VacancyApplicationStatus } from "@/types";

interface MyVacancyApplicationResponse {
  vacancyApplicationId: string;
  vacancyId: string;
  studentProfileId: string;
  status: VacancyApplicationStatus;
  appliedAt: string;
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
  const [applications, vacancies, companies, areas] = await Promise.all([
    apiClient.get<MyVacancyApplicationResponse[]>("/vacancy-application/me"),
    apiClient.get<Vacancy[]>("/vacancy"),
    apiClient.get<Company[]>("/company"),
    apiClient.get<Area[]>("/area"),
  ]);

  const rows = applications
    .map((item) => toRow(item, studentProfileId, vacancies, companies, areas))
    .filter((row): row is MyApplicationRow => row != null);

  return sortByRecent(rows);
}

function toRow(
  item: MyVacancyApplicationResponse,
  studentProfileId: string,
  vacancies: Vacancy[],
  companies: Company[],
  areas: Area[],
): MyApplicationRow | null {
  const vacancy = vacancies.find((v) => v.vacancyId === item.vacancyId);
  if (!vacancy) return null;

  const company = companies.find((c) => c.companyId === vacancy.companyId);
  const area = areas.find((a) => a.areaId === vacancy.areaId);

  const application: VacancyApplication = {
    vacancyApplicationId: item.vacancyApplicationId,
    vacancyId: item.vacancyId,
    studentProfileId,
    status: item.status,
    appliedAt: item.appliedAt,
    // `GET /vacancy-application/me` devuelve `VacancyApplicationStudentResponse`
    // (wire), que a propósito NO trae `accepted` — el alumno no puede ver si
    // quedó seleccionado (ver el aviso en `VacancyApplication`, types/index.ts).
    // Hardcodeado en `false`: ninguna pantalla de este dominio lo lee para
    // decidir nada, es solo para satisfacer el tipo compartido.
    accepted: false,
  };

  return {
    application,
    vacancy,
    companyName: company?.name ?? "Empresa no disponible",
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
