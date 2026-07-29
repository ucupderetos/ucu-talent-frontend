"use client";

// Datos de la tabla de "Mis ofertas" (vista empresa).

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import type {
  CompanyVacancyFilters,
  CompanyVacancyOrder,
  CompanyVacancyRow,
} from "@/features/puestos/types";
import type { Area, Department, Paginated, Vacancy, VacancyApplication } from "@/types";

const NEW_APPLICANT_WINDOW_DAYS = 7;
const DEFAULT_PER_PAGE = 5;

/** @public para invalidación puntual futura (AGENTS.md). */
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
    queryFn: ({ signal }) => fetchCompanyVacancies(companyId, filters, signal),
    enabled: Boolean(companyId),
  });
}

async function fetchCompanyVacancies(
  companyId: string | undefined,
  filters: CompanyVacancyFilters,
  signal?: AbortSignal,
): Promise<Paginated<CompanyVacancyRow>> {
  const page = filters.page ?? 1;
  const perPage = filters.perPage ?? DEFAULT_PER_PAGE;

  if (!companyId) return { items: [], total: 0, page, perPage };

  const rows = await fetchCompanyVacancyRows(companyId, signal);
  const filtered = filterRows(rows, filters);
  const sorted = sortRows(filtered, filters.order);

  const start = (page - 1) * perPage;
  const items = sorted.slice(start, start + perPage);

  return { items, total: sorted.length, page, perPage };
}

async function fetchCompanyVacancyRows(
  companyId: string,
  signal?: AbortSignal,
): Promise<CompanyVacancyRow[]> {
  const [vacancies, areas] = await Promise.all([
    apiClient.get<Vacancy[]>("/vacancy", { signal }),
    fetchAreas(signal),
  ]);

  const ownVacancies = vacancies.filter((vacancy) => vacancy.companyId === companyId);

  return Promise.all(
    ownVacancies.map(async (vacancy) =>
      toRow(vacancy, areas, await fetchVacancyApplications(vacancy.vacancyId, signal)),
    ),
  );
}

async function fetchAreas(signal?: AbortSignal): Promise<Area[]> {
  try {
    return await apiClient.get<Area[]>("/area", { signal });
  } catch {
    // El nombre de área es auxiliar: no debería bloquear el listado de puestos.
    return [];
  }
}

interface VacancyApplicationsResult {
  applications: Pick<VacancyApplication, "appliedAt">[];
  /** `false` si el fetch falló: el conteo de postulantes de esa fila quedó
   *  desconocido, no en cero (ver `toRow` y el gate de A-06 en
   *  `vacancy-table.tsx`). */
  countKnown: boolean;
}

async function fetchVacancyApplications(
  vacancyId: string,
  signal?: AbortSignal,
): Promise<VacancyApplicationsResult> {
  try {
    const applications = await apiClient.get<VacancyApplication[]>("/vacancy-application", {
      params: { vacancyId },
      signal,
    });
    return { applications, countKnown: true };
  } catch {
    // El conteo de postulantes no debe impedir ver las vacantes propias, pero
    // tampoco puede caer silenciosamente en "0 postulantes": eso habilitaría
    // el gate de edición (A-06) para una oferta que en realidad sí tiene
    // postulantes. `countKnown: false` avisa que ese "0" no es confiable.
    return { applications: [], countKnown: false };
  }
}

function toRow(
  vacancy: Vacancy,
  areas: Area[],
  applicationsResult: VacancyApplicationsResult,
): CompanyVacancyRow {
  const { applications, countKnown } = applicationsResult;
  const weekAgo = Date.now() - NEW_APPLICANT_WINDOW_DAYS * 24 * 60 * 60 * 1000;

  return {
    ...vacancy,
    areaName: areas.find((area) => area.areaId === vacancy.areaId)?.name ?? "—",
    applicantsCount: applications.length,
    applicantsCountKnown: countKnown,
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
    if (filters.statuses?.length && !filters.statuses.includes(row.status)) return false;
    if (filters.areaIds?.length && !filters.areaIds.includes(row.areaId)) return false;
    if (filters.locations?.length && !filters.locations.includes(row.location)) return false;
    if (filters.publishedFrom || filters.publishedTo) {
      const publishedDate = row.publicationDate.slice(0, 10);
      if (filters.publishedFrom && publishedDate < filters.publishedFrom) return false;
      if (filters.publishedTo && publishedDate > filters.publishedTo) return false;
    }
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

/** `publicationDate` siempre está seteada (la define la empresa al crear, no
 *  el backend al aprobar — ver el aviso en `Vacancy`, `@/types`), así que no
 *  hace falta un caso para "todavía sin publicar". */
function publishedTimestamp(row: CompanyVacancyRow): number {
  return new Date(row.publicationDate).getTime();
}

/**
 * Opciones de los selects de área/ubicación: se calculan sobre TODAS las
 * vacantes de la empresa (sin aplicar los filtros activos), para que el
 * dropdown no vaya perdiendo opciones a medida que se filtra.
 *
 * TODO(api): cuando exista el contrato, esto probablemente lo devuelva el
 * propio endpoint de filtros (facets) en vez de calcularse en el cliente.
 */
export function useCompanyVacancyFilterOptions(companyId: string | undefined): {
  areas: Area[];
  locations: Department[];
} {
  const query = useQuery({
    queryKey: ["puestos", "empresa", companyId, "opciones-filtro"] as const,
    queryFn: ({ signal }) => fetchCompanyVacancyFilterOptions(companyId, signal),
    enabled: Boolean(companyId),
  });

  return query.data ?? { areas: [], locations: [] };
}

async function fetchCompanyVacancyFilterOptions(
  companyId: string | undefined,
  signal?: AbortSignal,
): Promise<{ areas: Area[]; locations: Department[] }> {
  if (!companyId) return { areas: [], locations: [] };

  const [vacancies, areas] = await Promise.all([
    apiClient.get<Vacancy[]>("/vacancy", { signal }),
    fetchAreas(signal),
  ]);

  return buildFilterOptions(
    vacancies.filter((vacancy) => vacancy.companyId === companyId),
    areas,
  );
}

function buildFilterOptions(
  vacancies: Vacancy[],
  areas: Area[],
): { areas: Area[]; locations: Department[] } {
  const areaIds = new Set(vacancies.map((vacancy) => vacancy.areaId));
  const locations = Array.from(new Set(vacancies.map((vacancy) => vacancy.location))).sort();

  return {
    areas: areas.filter((area) => areaIds.has(area.areaId)),
    locations,
  };
}
