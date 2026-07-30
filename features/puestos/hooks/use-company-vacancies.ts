"use client";

// Datos de la tabla de "Mis ofertas" (vista empresa).
//
// ⚠️ 2026-07-30: migrado de `GET /vacancy` + un `GET /vacancy-application`
// por vacante a `GET /vacancy/company/{companyId}/management` (un solo
// endpoint agregado, verificado contra el código fuente del backend —
// ninguna versión de `ENDPOINTS.md` lo documentaba). El backend ya resuelve
// `companyName`/`areaName`/`applicationCount`/`newApplicationsCount` y ya
// filtra `deleted = false` (`VacancyRepository.findManagementByCompanyId`),
// así que el N+1 anterior desaparece del todo.

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import { useAreas } from "@/features/puestos/hooks/use-areas";
import type {
  CompanyVacancyFilters,
  CompanyVacancyOrder,
  CompanyVacancyRow,
} from "@/features/puestos/types";
import type { Area, Department, Paginated, Vacancy } from "@/types";

const DEFAULT_PER_PAGE = 5;

/** Wire real de `GET /vacancy/company/{companyId}/management`
 *  (`vacancy/dto/VacancyManagementResponse.java`, rama `dev`). */
interface VacancyManagementResponse {
  vacancy: Vacancy;
  companyName: string;
  areaName: string;
  applicationCount: number;
  newApplicationsCount: number;
}

/** @public para invalidación puntual futura (AGENTS.md). */
export function companyVacanciesQueryKey(
  companyId: string | undefined,
  filters: CompanyVacancyFilters,
) {
  return ["puestos", "empresa", companyId, filters] as const;
}

function companyManagementQueryKey(companyId: string | undefined) {
  return ["puestos", "empresa", companyId, "management"] as const;
}

/** Base compartida: TanStack Query dedupea por `queryKey`, así que
 *  `useCompanyVacancies` y `useCompanyVacancyFilterOptions` (montados juntos
 *  en `company-vacancies-view.tsx`) comparten el mismo fetch en vez de
 *  pedir la lista dos veces. */
function useCompanyManagementRows(companyId: string | undefined) {
  return useQuery({
    queryKey: companyManagementQueryKey(companyId),
    queryFn: ({ signal }) => fetchCompanyManagementRows(companyId, signal),
    enabled: Boolean(companyId),
  });
}

async function fetchCompanyManagementRows(
  companyId: string | undefined,
  signal?: AbortSignal,
): Promise<CompanyVacancyRow[]> {
  if (!companyId) return [];

  const rows = await apiClient.get<VacancyManagementResponse[]>(
    `/vacancy/company/${companyId}/management`,
    { signal },
  );

  return rows.map(toRow);
}

function toRow(row: VacancyManagementResponse): CompanyVacancyRow {
  return {
    ...row.vacancy,
    areaName: row.areaName,
    applicantsCount: row.applicationCount,
    // El endpoint agregado no puede fallar "por fila": si la llamada se cae,
    // toda la lista se cae con ella (isError de useCompanyVacancies) — no
    // hay un escenario de "esta fila puntual no sabe su conteo".
    applicantsCountKnown: true,
    unreviewedApplicantsCount: row.newApplicationsCount,
  };
}

export function useCompanyVacancies(
  companyId: string | undefined,
  filters: CompanyVacancyFilters,
) {
  const query = useCompanyManagementRows(companyId);

  const page = filters.page ?? 1;
  const perPage = filters.perPage ?? DEFAULT_PER_PAGE;

  const data: Paginated<CompanyVacancyRow> | undefined = query.data
    ? paginate(sortRows(filterRows(query.data, filters), filters.order), page, perPage)
    : undefined;

  return { ...query, data };
}

function paginate<T>(rows: T[], page: number, perPage: number): Paginated<T> {
  const start = (page - 1) * perPage;
  return { items: rows.slice(start, start + perPage), total: rows.length, page, perPage };
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
 * El área real (con su `parentAreaId`) sale de `useAreas()` — el catálogo
 * completo, cacheado 5 min (`use-areas.ts`) y ya usado en el resto de la
 * app — filtrado a las que esta empresa efectivamente usa. El endpoint de
 * management solo da `areaName` (string plano), no alcanza para reconstruir
 * un `Area` real sin inventarle un `parentAreaId`.
 */
export function useCompanyVacancyFilterOptions(companyId: string | undefined): {
  areas: Area[];
  locations: Department[];
} {
  const { data: rows } = useCompanyManagementRows(companyId);
  const { data: allAreas } = useAreas();

  if (!rows) return { areas: [], locations: [] };

  const areaIds = new Set(rows.map((row) => row.areaId));
  const locations = Array.from(new Set(rows.map((row) => row.location))).sort();

  return {
    areas: (allAreas ?? []).filter((area) => areaIds.has(area.areaId)),
    locations,
  };
}
