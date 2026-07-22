"use client";

// Datos de la tabla de "Mis ofertas" (vista empresa).
//
// ⚠️ ANDAMIO TEMPORAL: el contrato de la API todavía no está definido (ver
// AGENTS.md — "Todavía NO existe: el contrato de la API"). Esto simula un
// `GET /companies/:id/vacancies?...` paginado y filtrado, pero resuelve todo
// en memoria sobre `lib/fixtures.ts`.
//
// TODO(api): cuando el contrato exista, `fetchCompanyVacancies` pasa a llamar
// a `apiClient.get<Paginated<CompanyVacancyRow>>(...)` con `filters` como
// query params, y se borra el filtrado/orden/paginación de acá abajo.

import { useQuery } from "@tanstack/react-query";

import { MOCK_APPLICATIONS, MOCK_AREAS, MOCK_VACANCIES } from "@/lib/fixtures";
import type {
  CompanyVacancyFilters,
  CompanyVacancyOrder,
  CompanyVacancyRow,
} from "@/features/puestos/types";
import type { Paginated, Vacancy } from "@/types";

const NEW_APPLICANT_WINDOW_DAYS = 7;
const DEFAULT_PER_PAGE = 5;

export function companyVacanciesQueryKey(
  companyId: string | undefined,
  filters: CompanyVacancyFilters,
) {
  return ["puestos", "empresa", companyId, filters] as const;
}

export function useCompanyVacancies(
  companyId: string | undefined,
  filters: CompanyVacancyFilters,
) {
  return useQuery({
    queryKey: companyVacanciesQueryKey(companyId, filters),
    queryFn: () => fetchCompanyVacancies(companyId, filters),
    enabled: Boolean(companyId),
  });
}

async function fetchCompanyVacancies(
  companyId: string | undefined,
  filters: CompanyVacancyFilters,
): Promise<Paginated<CompanyVacancyRow>> {
  const page = filters.page ?? 1;
  const perPage = filters.perPage ?? DEFAULT_PER_PAGE;

  if (!companyId) return { items: [], total: 0, page, perPage };

  const rows = MOCK_VACANCIES.filter((vacancy) => vacancy.companyId === companyId).map(toRow);
  const filtered = filterRows(rows, filters);
  const sorted = sortRows(filtered, filters.order);

  const start = (page - 1) * perPage;
  const items = sorted.slice(start, start + perPage);

  return { items, total: sorted.length, page, perPage };
}

function toRow(vacancy: Vacancy): CompanyVacancyRow {
  const applications = MOCK_APPLICATIONS.filter((a) => a.vacancyId === vacancy.vacancyId);
  const weekAgo = Date.now() - NEW_APPLICANT_WINDOW_DAYS * 24 * 60 * 60 * 1000;

  return {
    ...vacancy,
    areaName: MOCK_AREAS.find((area) => area.areaId === vacancy.areaId)?.name ?? "—",
    applicantsCount: applications.length,
    newApplicantsThisWeek: applications.filter((a) => new Date(a.appliedAt).getTime() >= weekAgo)
      .length,
  };
}

function filterRows(
  rows: CompanyVacancyRow[],
  filters: CompanyVacancyFilters,
): CompanyVacancyRow[] {
  const search = filters.search?.trim().toLowerCase();

  return rows.filter((row) => {
    if (filters.status && row.status !== filters.status) return false;
    if (filters.areaId && row.areaId !== filters.areaId) return false;
    if (filters.location && row.location !== filters.location) return false;
    if (search) {
      const haystack = `${row.name} ${row.areaName}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });
}

function sortRows(
  rows: CompanyVacancyRow[],
  order: CompanyVacancyOrder = "recent",
): CompanyVacancyRow[] {
  const sorted = [...rows];

  switch (order) {
    case "oldest":
      return sorted.sort((a, b) => publishedTimestamp(a) - publishedTimestamp(b));
    case "applicants":
      return sorted.sort((a, b) => b.applicantsCount - a.applicantsCount);
    case "recent":
    default:
      return sorted.sort((a, b) => publishedTimestamp(b) - publishedTimestamp(a));
  }
}

/** 0 para vacantes sin `publicationDate` (todavía `PENDIENTE`): el wire real
 *  no tiene `createdAt`, así que no hay una fecha mejor para ordenarlas. */
function publishedTimestamp(row: CompanyVacancyRow): number {
  return row.publicationDate ? new Date(row.publicationDate).getTime() : 0;
}
