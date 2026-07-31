"use client";

// tabla de "Postulaciones" (vista admin).
//
// `GET /vacancy-application/detailed` (ADMIN) devuelve el listado global YA
// resuelto (`AdminApplicationDetailedResponse`, ver `features/moderacion/types.ts`):
// una sola request, sin el fetch-all × 4 (student-profile/user/vacancy/company)
// + un GET por status del enum que hacía la versión anterior de este hook.

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import type {
  AdminApplicationDetailedResponse,
  AdminApplicationFilters,
  AdminApplicationOrder,
  AdminApplicationRow,
} from "@/features/moderacion/types";
import type { Company, Paginated, Vacancy } from "@/types";

const DEFAULT_PER_PAGE = 10;

/** @public para invalidación puntual futura (`docs/agents/data-fetching.md`). */
export function applicationsQueryKey(filters: AdminApplicationFilters) {
  return ["moderacion", "postulaciones", filters] as const;
}

export function useApplications(filters: AdminApplicationFilters) {
  return useQuery({
    queryKey: applicationsQueryKey(filters),
    queryFn: ({ signal }) => fetchApplications(filters, signal),
  });
}

async function fetchApplications(
  filters: AdminApplicationFilters,
  signal: AbortSignal,
): Promise<Paginated<AdminApplicationRow>> {
  const page = filters.page ?? 1;
  const perPage = filters.perPage ?? DEFAULT_PER_PAGE;

  const detailed = await apiClient.get<AdminApplicationDetailedResponse[]>(
    "/vacancy-application/detailed",
    { signal },
  );

  const rows = detailed.map(toRow);
  const filtered = filterRows(rows, filters);
  const sorted = sortRows(filtered, filters.order);

  const start = (page - 1) * perPage;
  const items = sorted.slice(start, start + perPage);

  return { items, total: sorted.length, page, perPage };
}

function toRow(item: AdminApplicationDetailedResponse): AdminApplicationRow {
  return {
    ...item.application,
    studentName: item.studentName,
    studentSurname: item.studentSurname,
    studentEmail: item.studentEmail,
    vacancyName: item.vacancyName,
    companyId: item.companyId,
    companyName: item.companyName,
  };
}

function filterRows(
  rows: AdminApplicationRow[],
  filters: AdminApplicationFilters,
): AdminApplicationRow[] {
  const search = filters.search?.trim().toLowerCase();

  return rows.filter((row) => {
    if (filters.vacancyIds?.length && !filters.vacancyIds.includes(row.vacancyId)) return false;
    if (
      filters.companyIds?.length &&
      (!row.companyId || !filters.companyIds.includes(row.companyId))
    )
      return false;
    if (filters.statuses?.length && !filters.statuses.includes(row.status)) return false;
    if (search) {
      const haystack = `${row.studentName} ${row.studentSurname} ${row.studentEmail} ${row.vacancyName}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });
}

function sortRows(
  rows: AdminApplicationRow[],
  order: AdminApplicationOrder = "recent",
): AdminApplicationRow[] {
  const sorted = [...rows];
  const delta = (a: AdminApplicationRow, b: AdminApplicationRow) =>
    new Date(a.appliedAt).getTime() - new Date(b.appliedAt).getTime();

  return order === "oldest" ? sorted.sort(delta) : sorted.sort((a, b) => -delta(a, b));
}

/** opciones de los multiselect: catalogo completo de ofertas/empresas, sin
 *  filtro. query key propia para no repedirlo con cada cambio de filtro. */
export function useApplicationFilterOptions(): { vacancies: Vacancy[]; companies: Company[] } {
  const { data } = useQuery({
    queryKey: ["moderacion", "postulaciones-filtros"],
    queryFn: async () => {
      const [vacancies, companies] = await Promise.all([
        apiClient.get<Vacancy[]>("/vacancy"),
        apiClient.get<Company[]>("/company"),
      ]);
      return { vacancies, companies };
    },
  });

  return data ?? { vacancies: [], companies: [] };
}
