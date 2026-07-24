"use client";

// Datos del listado de vacantes para el Admin.
//
// Andamio temporal: la rama todavía representa los estados de `api-dev`
// (`PENDIENTE | FINALIZADO`) y los fixtures compartidos tienen esa misma
// forma. No se crea un enum paralelo para anticipar `PUBLICADO`: cuando A-14
// aterrice en los tipos core, solo cambia `fetchAdminVacancies`; la vista
// sigue consumiendo TanStack Query.

import { useQuery } from "@tanstack/react-query";

import type {
  AdminVacancyFilters,
  AdminVacancyRow,
} from "@/features/moderacion/types";
import {
  MOCK_APPLICATIONS,
  MOCK_COMPANIES,
  MOCK_VACANCIES,
} from "@/lib/fixtures";
import type { Company, Paginated } from "@/types";

const DEFAULT_PER_PAGE = 10;

export function adminVacanciesQueryKey(filters: AdminVacancyFilters) {
  return ["moderacion", "ofertas", filters] as const;
}

export function useAdminVacancies(filters: AdminVacancyFilters) {
  return useQuery({
    queryKey: adminVacanciesQueryKey(filters),
    queryFn: () => fetchAdminVacancies(filters),
  });
}

export function adminVacancyCompaniesQueryKey() {
  return ["moderacion", "ofertas", "empresas"] as const;
}

/** Solo ofrece empresas que tienen al menos una vacante en el listado. */
export function useAdminVacancyCompanies() {
  return useQuery({
    queryKey: adminVacancyCompaniesQueryKey(),
    queryFn: async (): Promise<Company[]> => {
      const companyIds = new Set(MOCK_VACANCIES.map((vacancy) => vacancy.companyId));

      return MOCK_COMPANIES.filter((company) => companyIds.has(company.companyId)).sort(
        (a, b) => a.name.localeCompare(b.name, "es"),
      );
    },
  });
}

async function fetchAdminVacancies(
  filters: AdminVacancyFilters,
): Promise<Paginated<AdminVacancyRow>> {
  const page = filters.page ?? 1;
  const perPage = filters.perPage ?? DEFAULT_PER_PAGE;
  const filtered = filterRows(allVacancyRows(), filters);
  const sorted = sortByPublicationDate(filtered);
  const start = (page - 1) * perPage;

  return {
    items: sorted.slice(start, start + perPage),
    total: sorted.length,
    page,
    perPage,
  };
}

function allVacancyRows(): AdminVacancyRow[] {
  const companiesById = new Map(
    MOCK_COMPANIES.map((company) => [company.companyId, company] as const),
  );
  const applicationCountByVacancy = new Map<string, number>();

  for (const application of MOCK_APPLICATIONS) {
    applicationCountByVacancy.set(
      application.vacancyId,
      (applicationCountByVacancy.get(application.vacancyId) ?? 0) + 1,
    );
  }

  return MOCK_VACANCIES.map((vacancy) => {
    const company = companiesById.get(vacancy.companyId);
    const companyName = company?.name ?? "Empresa no disponible";

    return {
      ...vacancy,
      companyName,
      companyInitials: initialsOf(companyName),
      applicationCount: applicationCountByVacancy.get(vacancy.vacancyId) ?? 0,
    };
  });
}

function filterRows(
  rows: AdminVacancyRow[],
  filters: AdminVacancyFilters,
): AdminVacancyRow[] {
  const search = filters.search?.trim().toLocaleLowerCase("es");

  return rows.filter((row) => {
    if (filters.companyIds?.length && !filters.companyIds.includes(row.companyId)) {
      return false;
    }
    if (filters.statuses?.length && !filters.statuses.includes(row.status)) {
      return false;
    }
    if (filters.modalities?.length && !filters.modalities.includes(row.modality)) {
      return false;
    }
    if (search) {
      const haystack = `${row.name} ${row.companyName} ${row.contractType}`.toLocaleLowerCase(
        "es",
      );
      if (!haystack.includes(search)) return false;
    }

    return true;
  });
}

/** Las ofertas con fecha más reciente aparecen primero; las que todavía no
 * tienen fecha quedan al final y se ordenan por nombre. */
function sortByPublicationDate(rows: AdminVacancyRow[]): AdminVacancyRow[] {
  return [...rows].sort((a, b) => {
    const aTime = a.publicationDate ? new Date(a.publicationDate).getTime() : -1;
    const bTime = b.publicationDate ? new Date(b.publicationDate).getTime() : -1;

    return bTime - aTime || a.name.localeCompare(b.name, "es");
  });
}

function initialsOf(name: string): string {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("");

  return initials.toUpperCase();
}
