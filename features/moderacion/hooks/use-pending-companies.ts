"use client";

// trae las empresas pendientes de aprobar, ya contra el back real.
//
// GET /company te tira todas las empresas con el status adentro, asi que no
// hace falta ir fila por fila. lo unico que le falta son email y fecha de
// registro, que viven en User, entonces pedimos GET /user?status=PENDIENTE&
// role=EMPRESA aparte y cruzamos por companyId === userId (misma pk). dos
// requests y listo, nada de loopear por usuario como habiamos armado antes.

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import type { PendingCompaniesFilters, PendingCompanyRow } from "@/features/moderacion/types";
import type { Company, Paginated, User } from "@/types";

const DEFAULT_PER_PAGE = 10;

/** @public para invalidación puntual futura (`docs/agents/data-fetching.md`). */
export function pendingCompaniesQueryKey(filters: PendingCompaniesFilters) {
  return ["moderacion", "empresas-pendientes", filters] as const;
}

export function usePendingCompanies(filters: PendingCompaniesFilters) {
  return useQuery({
    queryKey: pendingCompaniesQueryKey(filters),
    queryFn: () => fetchPendingCompanies(filters),
  });
}

/** opciones del multiselect de industria: solo las de empresas pendientes,
 *  asi el dropdown no ofrece cosas que no van a filtrar nada. */
export function usePendingCompanyIndustries() {
  const { data } = useQuery({
    queryKey: ["moderacion", "empresas-industrias"],
    queryFn: async () => {
      const companies = await apiClient.get<Company[]>("/company");
      return Array.from(
        new Set(companies.filter((c) => c.status === "PENDIENTE").map((c) => c.industry)),
      ).sort();
    },
  });
  return data ?? [];
}

async function fetchPendingCompanies(
  filters: PendingCompaniesFilters,
): Promise<Paginated<PendingCompanyRow>> {
  const page = filters.page ?? 1;
  const perPage = filters.perPage ?? DEFAULT_PER_PAGE;

  const [pendingUsers, companies] = await Promise.all([
    apiClient.get<User[]>("/user", { params: { status: "PENDIENTE", role: "EMPRESA" } }),
    apiClient.get<Company[]>("/company"),
  ]);

  const pendingUsersById = new Map(pendingUsers.map((u) => [u.userId, u]));
  const rows = companies
    .filter((c) => c.status === "PENDIENTE" && pendingUsersById.has(c.companyId))
    .map((c) => toRow(c, pendingUsersById.get(c.companyId)!));
  const filtered = filterRows(rows, filters);

  const start = (page - 1) * perPage;
  const items = filtered.slice(start, start + perPage);

  return { items, total: filtered.length, page, perPage };
}

function toRow(company: Company, user: User): PendingCompanyRow {
  return {
    ...company,
    email: user.email,
    registeredAt: user.registeredAt,
  };
}

function filterRows(
  rows: PendingCompanyRow[],
  filters: PendingCompaniesFilters,
): PendingCompanyRow[] {
  const search = filters.search?.trim().toLowerCase();

  return rows.filter((row) => {
    if (filters.industries?.length && !filters.industries.includes(row.industry)) return false;
    if (search) {
      const haystack = `${row.name} ${row.industry} ${row.email}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });
}
