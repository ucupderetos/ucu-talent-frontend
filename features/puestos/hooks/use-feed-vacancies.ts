"use client";

// Datos del feed de vacantes (vista alumno) — RF-14.
//
// ⚠️ ANDAMIO TEMPORAL, mismo patrón que use-company-vacancies.ts: el contrato
// real de paginación/filtros del feed todavía no existe (A-04/A-05 en
// AGENTS.md — GET /vacancy hoy solo acepta un query param a la vez, sin
// keyword ni orden por match). Esto resuelve todo en memoria sobre
// lib/fixtures.ts.
//
// Solo muestra vacantes `PENDIENTE`: es el único estado no-terminal que el
// backend real expone hoy (ver el gap de VacancyStatus en types/index.ts) —
// "visible para alumnos", tal como lo etiqueta VACANCY_STATUS_DESCRIPTION.
//
// TODO(api): cuando exista el contrato, `fetchFeedVacancies` pasa a llamar
// `apiClient.get<Paginated<Vacancy>>("/vacancy", { params: { status: "PENDIENTE", ... } })`
// y se borra el filtrado/orden de acá abajo.

import { useQuery } from "@tanstack/react-query";

import { MOCK_AREAS, MOCK_COMPANIES, MOCK_VACANCIES } from "@/lib/fixtures";
import type { FeedFilters, FeedVacancyRow } from "@/features/puestos/types";
import type { Vacancy } from "@/types";

export function feedVacanciesQueryKey(filters: FeedFilters) {
  return ["puestos", "feed", filters] as const;
}

export function useFeedVacancies(filters: FeedFilters) {
  return useQuery({
    queryKey: feedVacanciesQueryKey(filters),
    queryFn: () => fetchFeedVacancies(filters),
  });
}

async function fetchFeedVacancies(filters: FeedFilters): Promise<FeedVacancyRow[]> {
  const rows = MOCK_VACANCIES.filter((vacancy) => vacancy.status === "PENDIENTE").map(toRow);
  return sortByRecent(filterRows(rows, filters));
}

function toRow(vacancy: Vacancy): FeedVacancyRow {
  const area = MOCK_AREAS.find((a) => a.areaId === vacancy.areaId) ?? null;
  const parentArea = area?.parentAreaId
    ? (MOCK_AREAS.find((a) => a.areaId === area.parentAreaId) ?? null)
    : null;

  return {
    ...vacancy,
    companyName: MOCK_COMPANIES.find((c) => c.companyId === vacancy.companyId)?.name ?? "—",
    areaName: area?.name ?? "—",
    parentAreaName: parentArea?.name ?? null,
  };
}

function filterRows(rows: FeedVacancyRow[], filters: FeedFilters): FeedVacancyRow[] {
  const search = filters.search?.trim().toLowerCase();

  return rows.filter((row) => {
    if (filters.areaId && row.areaId !== filters.areaId) return false;
    if (filters.contractType && row.contractType !== filters.contractType) return false;
    if (search) {
      const haystack = `${row.name} ${row.companyName} ${row.areaName}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });
}

function sortByRecent(rows: FeedVacancyRow[]): FeedVacancyRow[] {
  return [...rows].sort((a, b) => publishedTimestamp(b) - publishedTimestamp(a));
}

/** 0 para vacantes sin `publicationDate` — el wire real no tiene un
 *  `createdAt` alternativo para ordenarlas (mismo criterio que la tabla de
 *  "Mis ofertas" del lado empresa). */
function publishedTimestamp(row: FeedVacancyRow): number {
  return row.publicationDate ? new Date(row.publicationDate).getTime() : 0;
}
