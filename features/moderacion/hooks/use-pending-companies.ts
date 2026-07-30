"use client";

// trae las empresas pendientes de aprobar, ya contra el back real.
//
// base = User (PENDIENTE, rol EMPRESA), no Company: una empresa puede haber
// completado el paso 1 del registro (POST /user) y nunca el paso 2
// (POST /company) — antes esa cuenta desaparecia de la cola entera. Ahora
// se muestra igual, con los campos de la empresa vacios.

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import type { PendingCompaniesFilters, PendingCompanyRow } from "@/features/moderacion/types";
import type { Company, Paginated, User } from "@/types";

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

  const companiesById = new Map(companies.map((c) => [c.companyId, c]));
  const rows = pendingUsers.map((user) => toRow(user, companiesById.get(user.userId)));
  const filtered = filterRows(rows, filters);

  const start = (page - 1) * perPage;
  const items = filtered.slice(start, start + perPage);

  return { items, total: filtered.length, page, perPage };
}

function toRow(user: User, company: Company | undefined): PendingCompanyRow {
  return {
    companyId: user.userId,
    name: company?.name ?? "",
    industry: company?.industry ?? null,
    description: company?.description ?? null,
    webUrl: company?.webUrl ?? null,
    linkedinUrl: company?.linkedinUrl ?? null,
    location: company?.location ?? null,
    status: user.status,
    reviewedAt: company?.reviewedAt ?? null,
    adminComment: company?.adminComment ?? null,
    hasProfile: company !== undefined,
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
    if (filters.industries?.length && (!row.industry || !filters.industries.includes(row.industry)))
      return false;
    if (search) {
      const haystack = `${row.name} ${row.industry ?? ""} ${row.email}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });
}
