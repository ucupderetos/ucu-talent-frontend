"use client";

// Datos del listado de vacantes para el Admin.
//
// Andamio temporal: resuelve todo sobre `lib/fixtures.ts`. El endpoint real
// (`GET /vacancy` + `PUT /vacancy/status/{id}` para moderar, ver
// docs/ENDPOINTS.md) ya está confirmado con los 3 estados de `VacancyStatus`
// — cuando se enchufe, solo cambia `fetchAdminVacancies`; la vista sigue
// consumiendo TanStack Query.

import { useQuery } from "@tanstack/react-query";

import type {
  AdminVacancyDetail,
  AdminVacancyFilters,
  AdminVacancyRow,
} from "@/features/moderacion/types";
import {
  MOCK_APPLICATIONS,
  MOCK_AREAS,
  MOCK_COMPANIES,
  MOCK_COMPANY_USERS,
  MOCK_USERS,
  MOCK_VACANCIES,
} from "@/lib/fixtures";
import type { Company, Paginated, VacancyApplicationStatus } from "@/types";

const DEFAULT_PER_PAGE = 10;

/** @public para invalidación puntual futura (AGENTS.md). */
export function adminVacanciesQueryKey(filters: AdminVacancyFilters) {
  return ["moderacion", "ofertas", filters] as const;
}

export function useAdminVacancies(filters: AdminVacancyFilters) {
  return useQuery({
    queryKey: adminVacanciesQueryKey(filters),
    queryFn: () => fetchAdminVacancies(filters),
  });
}

export function adminVacancyDetailQueryKey(vacancyId: string) {
  return ["moderacion", "ofertas", "detalle", vacancyId] as const;
}

export function useAdminVacancyDetail(vacancyId: string) {
  return useQuery({
    queryKey: adminVacancyDetailQueryKey(vacancyId),
    queryFn: async (): Promise<AdminVacancyDetail | null> =>
      allVacancyDetails().find((vacancy) => vacancy.vacancyId === vacancyId) ?? null,
    enabled: Boolean(vacancyId),
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
  const filtered = filterRows(allVacancyDetails(), filters);
  const sorted = sortByPublicationDate(filtered);
  const start = (page - 1) * perPage;

  return {
    items: sorted.slice(start, start + perPage),
    total: sorted.length,
    page,
    perPage,
  };
}

/** El detalle es el superset de la fila, por lo que listado y pantalla de
 *  detalle se construyen desde la misma fuente y no pueden desfasarse. */
function allVacancyDetails(): AdminVacancyDetail[] {
  const companiesById = new Map(
    MOCK_COMPANIES.map((company) => [company.companyId, company] as const),
  );
  const companyUsersById = new Map(
    [MOCK_USERS.EMPRESA, ...MOCK_COMPANY_USERS].map((user) => [user.userId, user] as const),
  );
  const areasById = new Map(MOCK_AREAS.map((area) => [area.areaId, area] as const));
  const applicationsByVacancy = new Map<
    string,
    (typeof MOCK_APPLICATIONS)[number][]
  >();

  for (const application of MOCK_APPLICATIONS) {
    const applications = applicationsByVacancy.get(application.vacancyId) ?? [];
    applications.push(application);
    applicationsByVacancy.set(application.vacancyId, applications);
  }

  return MOCK_VACANCIES.map((vacancy) => {
    const company = companiesById.get(vacancy.companyId);
    const companyUser = companyUsersById.get(vacancy.companyId);
    const area = areasById.get(vacancy.areaId);
    const parentArea = area?.parentAreaId ? areasById.get(area.parentAreaId) : undefined;
    const applications = applicationsByVacancy.get(vacancy.vacancyId) ?? [];
    const companyName = company?.name ?? "Empresa no disponible";
    const applicationStatusCounts: Record<VacancyApplicationStatus, number> = {
      PENDIENTE: 0,
      VISTO: 0,
      FINALIZADA: 0,
    };

    for (const application of applications) {
      applicationStatusCounts[application.status] += 1;
    }

    return {
      ...vacancy,
      companyName,
      companyInitials: initialsOf(companyName),
      applicationCount: applications.length,
      company: company ? { ...company } : null,
      companyUser: companyUser ? { ...companyUser } : null,
      area: area ? { ...area } : null,
      parentArea: parentArea ? { ...parentArea } : null,
      applicationStatusCounts,
      // `selected` se eliminó del contrato (ver types/index.ts) — sin dato para
      // computar la métrica. Se deja en 0 hasta que el contrato lo reponga.
      selectedApplicationCount: 0,
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
    const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : -1;
    const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : -1;

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
