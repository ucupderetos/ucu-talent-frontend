"use client";

// Cola de empresas pendientes. Comparte la misma lectura real y la misma
// caché que el listado administrativo de empresas; solo cambia la proyección
// en memoria para conservar las filas PENDIENTE y aplicar sus filtros.

import { useQuery } from "@tanstack/react-query";

import {
  adminCompaniesQueryKey,
  fetchAdminCompanyDirectory,
  type AdminCompanyDirectoryEntry,
} from "@/features/moderacion/hooks/use-admin-companies";
import type { PendingCompaniesFilters, PendingCompanyRow } from "@/features/moderacion/types";
import type {  Paginated } from "@/types";

const DEFAULT_PER_PAGE = 10;

/** La cola es una proyección del directorio, no otra lectura del backend. */
export function pendingCompaniesQueryKey() {
  return adminCompaniesQueryKey();
}

export function usePendingCompanies(filters: PendingCompaniesFilters) {
  return useQuery({
    queryKey: pendingCompaniesQueryKey(),
    queryFn: ({ signal }) => fetchAdminCompanyDirectory(signal),
    select: (directory): Paginated<PendingCompanyRow> =>
      paginateAndFilterPendingCompanies(directory, filters),
  });
}

/** Opciones del multiselect: solo industrias presentes entre las empresas que
 * siguen pendientes. */
export function usePendingCompanyIndustries() {
  const { data } = useQuery({
    queryKey: pendingCompaniesQueryKey(),
    queryFn: ({ signal }) => fetchAdminCompanyDirectory(signal),
    select: (directory) =>
      Array.from(
        new Set(
          directory
            .filter(isPendingCompany)
            .map(({ company }) => company.industry),
        ),
      ).sort((a, b) => a.localeCompare(b, "es")),
  });

  return data ?? [];
}

function paginateAndFilterPendingCompanies(
  directory: AdminCompanyDirectoryEntry[],
  filters: PendingCompaniesFilters,
): Paginated<PendingCompanyRow> {
  const page = filters.page ?? 1;
  const perPage = filters.perPage ?? DEFAULT_PER_PAGE;
  const rows = directory.filter(isPendingCompany).map(toPendingCompanyRow);
  const filtered = filterRows(rows, filters);
  const start = (page - 1) * perPage;
  return {
    items: filtered.slice(start, start + perPage),
    total: filtered.length,
    page,
    perPage,
  };
}

function isPendingCompany({ company, user }: AdminCompanyDirectoryEntry): boolean {
  return (user?.status ?? company.status) === "PENDIENTE";
}

function toPendingCompanyRow({
  company,
  user,
}: AdminCompanyDirectoryEntry): PendingCompanyRow {
  return {
    ...company,
    status: user?.status ?? company.status,
    email: user?.email ?? "—",
    registeredAt: user?.registeredAt ?? "",
  };
}

function filterRows(
  rows: PendingCompanyRow[],
  filters: PendingCompaniesFilters,
): PendingCompanyRow[] {
  const search = filters.search?.trim().toLocaleLowerCase("es");

  return rows.filter((row) => {
    if (filters.industries?.length && !filters.industries.includes(row.industry)) return false;
    if (search) {
      const haystack = `${row.name} ${row.industry} ${row.email}`.toLocaleLowerCase("es");
      if (!haystack.includes(search)) return false;
    }
    return true;
  });
}
