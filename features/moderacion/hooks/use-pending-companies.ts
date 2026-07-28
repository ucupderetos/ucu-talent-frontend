"use client";

// trae las empresas pendientes de aprobar. no hay endpoint todavia (el
// backend no tiene PUT /user ni expone status en Company), asi que por ahora
// junta todo en memoria sobre lib/fixtures.ts. cuando haya back se cambia
// fetchPendingCompanies por el fetch real y listo.

import { useQuery } from "@tanstack/react-query";

import { MOCK_COMPANIES, MOCK_COMPANY_USERS } from "@/lib/fixtures";
import type { PendingCompaniesFilters, PendingCompanyRow } from "@/features/moderacion/types";
import type { Paginated } from "@/types";

const DEFAULT_PER_PAGE = 10;

/** @public para invalidación puntual futura (AGENTS.md). */
export function pendingCompaniesQueryKey(filters: PendingCompaniesFilters) {
  return ["moderacion", "empresas-pendientes", filters] as const;
}

export function usePendingCompanies(filters: PendingCompaniesFilters) {
  return useQuery({
    queryKey: pendingCompaniesQueryKey(filters),
    queryFn: () => fetchPendingCompanies(filters),
  });
}

/** Opciones del multiselect de industria: solo las de empresas PENDIENTES,
 *  para no ofrecer opciones que no filtran nada. */
export function usePendingCompanyIndustries() {
  const { data } = useQuery({
    queryKey: ["moderacion", "empresas-industrias"],
    queryFn: () => {
      const pendingIds = new Set(
        MOCK_COMPANY_USERS.filter((u) => u.status === "PENDIENTE").map((u) => u.userId),
      );
      return Array.from(
        new Set(MOCK_COMPANIES.filter((c) => pendingIds.has(c.companyId)).map((c) => c.industry)),
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

  // solo las empresas cuyo user esta pendiente
  const pendingUserIds = new Set(
    MOCK_COMPANY_USERS.filter((u) => u.status === "PENDIENTE").map((u) => u.userId),
  );
  const rows = MOCK_COMPANIES.filter((c) => pendingUserIds.has(c.companyId)).map(toRow);
  const filtered = filterRows(rows, filters);

  const start = (page - 1) * perPage;
  const items = filtered.slice(start, start + perPage);

  return { items, total: filtered.length, page, perPage };
}

function toRow(company: (typeof MOCK_COMPANIES)[number]): PendingCompanyRow {
  const user = MOCK_COMPANY_USERS.find((u) => u.userId === company.companyId);

  return {
    ...company,
    email: user?.email ?? "—",
    registeredAt: user?.registeredAt ?? "",
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
