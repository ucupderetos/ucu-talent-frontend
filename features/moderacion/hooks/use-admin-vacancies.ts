"use client";

// Datos del listado y detalle de vacantes para el Admin. Los componentes
// consumen view models del dominio; todos los cruces con Company, User, Area
// y VacancyApplication se resuelven acá contra la API real.

import { useQuery } from "@tanstack/react-query";

import type {
  AdminVacancyDetail,
  AdminVacancyFilters,
  AdminVacancyRow,
} from "@/features/moderacion/types";
import { ApiError, apiClient } from "@/lib/api-client";
import type {
  Area,
  Company,
  Paginated,
  User,
  Vacancy,
  VacancyApplication,
  VacancyApplicationStatus,
} from "@/types";

const DEFAULT_PER_PAGE = 10;

interface AdminVacanciesSource {
  rows: AdminVacancyRow[];
  companies: Company[];
}

/** El listado y las opciones de empresa comparten esta consulta. */
export function adminVacanciesQueryKey() {
  return ["moderacion", "ofertas", "listado"] as const;
}

export function useAdminVacancies(filters: AdminVacancyFilters) {
  return useQuery({
    queryKey: adminVacanciesQueryKey(),
    queryFn: ({ signal }) => fetchAdminVacanciesSource(signal),
    select: (source) => paginateRows(source.rows, filters),
  });
}

export function adminVacancyDetailQueryKey(vacancyId: string) {
  return ["moderacion", "ofertas", "detalle", vacancyId] as const;
}

export function useAdminVacancyDetail(vacancyId: string) {
  return useQuery({
    queryKey: adminVacancyDetailQueryKey(vacancyId),
    queryFn: ({ signal }) => fetchAdminVacancyDetail(vacancyId, signal),
    enabled: Boolean(vacancyId),
  });
}

/** Solo ofrece empresas que tienen al menos una vacante visible en el listado. */
export function useAdminVacancyCompanies() {
  return useQuery({
    queryKey: adminVacanciesQueryKey(),
    queryFn: ({ signal }) => fetchAdminVacanciesSource(signal),
    select: (source) => source.companies,
  });
}

async function fetchAdminVacanciesSource(
  signal: AbortSignal,
): Promise<AdminVacanciesSource> {
  const [vacancies, companies, applications] = await Promise.all([
    apiClient.get<Vacancy[]>("/vacancy", { signal }),
    apiClient.get<Company[]>("/company", { signal }),
    // El backend no expone conteos por vacante para ADMIN. La variante con
    // ?vacancyId= exige ser la empresa dueña, por eso se usa el listado global.
    apiClient.get<VacancyApplication[]>("/vacancy-application", { signal }),
  ]);

  // El listado anterior estaba compuesto solo por ofertas no eliminadas. El
  // borrado lógico queda fuera para no cambiar ese universo al conectar la API.
  const visibleVacancies = vacancies.filter((vacancy) => !vacancy.deleted);
  const companiesById = new Map(
    companies.map((company) => [company.companyId, company]),
  );
  const applicationCounts = countApplicationsByVacancy(applications);
  const companyIds = new Set(
    visibleVacancies.map((vacancy) => vacancy.companyId),
  );

  return {
    rows: visibleVacancies.map((vacancy) =>
      toAdminVacancyRow(vacancy, companiesById.get(vacancy.companyId), applicationCounts),
    ),
    companies: companies
      .filter((company) => companyIds.has(company.companyId))
      .sort((a, b) => a.name.localeCompare(b.name, "es")),
  };
}

async function fetchAdminVacancyDetail(
  vacancyId: string,
  signal: AbortSignal,
): Promise<AdminVacancyDetail | null> {
  let vacancy: Vacancy;

  try {
    vacancy = await apiClient.get<Vacancy>(`/vacancy/${vacancyId}`, { signal });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }

  const [company, companyUser, area, allApplications] = await Promise.all([
    getOptional<Company>(`/company/${vacancy.companyId}`, signal),
    getOptional<User>(`/user/${vacancy.companyId}`, signal),
    getOptional<Area>(`/area/${vacancy.areaId}`, signal),
    apiClient.get<VacancyApplication[]>("/vacancy-application", { signal }),
  ]);
  const parentArea = area?.parentAreaId
    ? await getOptional<Area>(`/area/${area.parentAreaId}`, signal)
    : null;
  const applications = allApplications.filter(
    (application) => application.vacancyId === vacancy.vacancyId,
  );
  const applicationCounts = countApplicationsByVacancy(applications);
  const row = toAdminVacancyRow(vacancy, company ?? undefined, applicationCounts);
  const applicationStatusCounts = emptyApplicationStatusCounts();

  for (const application of applications) {
    applicationStatusCounts[application.status] += 1;
  }

  return {
    ...row,
    company,
    companyUser,
    area,
    parentArea,
    applicationStatusCounts,
    selectedApplicationCount: applications.filter((application) => application.accepted)
      .length,
  };
}

async function getOptional<T>(path: string, signal: AbortSignal): Promise<T | null> {
  try {
    return await apiClient.get<T>(path, { signal });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

function paginateRows(
  rows: AdminVacancyRow[],
  filters: AdminVacancyFilters,
): Paginated<AdminVacancyRow> {
  const page = filters.page ?? 1;
  const perPage = filters.perPage ?? DEFAULT_PER_PAGE;
  const filtered = filterRows(rows, filters);
  const sorted = sortByPublicationDate(filtered);
  const lastPage = Math.max(1, Math.ceil(sorted.length / perPage));
  const safePage = Math.min(Math.max(page, 1), lastPage);
  const start = (safePage - 1) * perPage;

  return {
    items: sorted.slice(start, start + perPage),
    total: sorted.length,
    page: safePage,
    perPage,
  };
}

function toAdminVacancyRow(
  vacancy: Vacancy,
  company: Company | undefined,
  applicationCounts: Map<string, number>,
): AdminVacancyRow {
  const companyName = company?.name ?? "Empresa no disponible";

  return {
    ...vacancy,
    companyName,
    companyInitials: initialsOf(companyName),
    applicationCount: applicationCounts.get(vacancy.vacancyId) ?? 0,
  };
}

function countApplicationsByVacancy(
  applications: VacancyApplication[],
): Map<string, number> {
  const counts = new Map<string, number>();

  for (const application of applications) {
    counts.set(
      application.vacancyId,
      (counts.get(application.vacancyId) ?? 0) + 1,
    );
  }

  return counts;
}

function emptyApplicationStatusCounts(): Record<VacancyApplicationStatus, number> {
  return {
    PENDIENTE: 0,
    VISTO: 0,
    FINALIZADO: 0,
  };
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

function sortByPublicationDate(rows: AdminVacancyRow[]): AdminVacancyRow[] {
  return [...rows].sort(
    (a, b) =>
      b.publicationDate.localeCompare(a.publicationDate) ||
      a.name.localeCompare(b.name, "es"),
  );
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
