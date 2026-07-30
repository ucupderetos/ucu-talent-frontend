"use client";

// Directorio administrativo de empresas. Company aporta los datos del perfil
// y User aporta email/fecha de registro; comparten PK (`companyId === userId`).

import { useQuery } from "@tanstack/react-query";

import type {
  AdminCompanyDetail,
  AdminCompanyFilters,
  AdminCompanyRow,
} from "@/features/moderacion/types";
import { ApiError, apiClient } from "@/lib/api-client";
import type { Company, Paginated, User } from "@/types";

const DEFAULT_PER_PAGE = 10;
const USER_PAGE_SIZE = 100;

interface AdminCompanyDirectoryEntry {
  company: Company;
  user: User | null;
}

/** Listado y catálogos derivados comparten la misma lectura/cache. */
export function adminCompaniesQueryKey() {
  return ["moderacion", "empresas", "listado"] as const;
}

export function useAdminCompanies(filters: AdminCompanyFilters) {
  return useQuery({
    queryKey: adminCompaniesQueryKey(),
    queryFn: ({ signal }) => fetchAdminCompanyDirectory(signal),
    select: (directory) => paginateAndFilter(directory, filters),
  });
}

export function adminCompanyDetailQueryKey(companyId: string) {
  return ["moderacion", "empresas", "detalle", companyId] as const;
}

export function useAdminCompanyDetail(companyId: string) {
  return useQuery({
    queryKey: adminCompanyDetailQueryKey(companyId),
    queryFn: ({ signal }) => fetchAdminCompanyDetail(companyId, signal),
    enabled: Boolean(companyId),
  });
}

export function useAdminCompanyIndustries() {
  return useQuery({
    queryKey: adminCompaniesQueryKey(),
    queryFn: ({ signal }) => fetchAdminCompanyDirectory(signal),
    select: (directory) =>
      Array.from(
        new Set(directory.map(({ company }) => company.industry)),
      ).sort((a, b) => a.localeCompare(b, "es")),
  });
}

export function useAdminCompanyLocations() {
  return useQuery({
    queryKey: adminCompaniesQueryKey(),
    queryFn: ({ signal }) => fetchAdminCompanyDirectory(signal),
    select: (directory) =>
      Array.from(
        new Set(
          directory.map(({ company }) => formatDepartment(company.location)),
        ),
      ).sort((a, b) => a.localeCompare(b, "es")),
  });
}

async function fetchAdminCompanyDirectory(
  signal: AbortSignal,
): Promise<AdminCompanyDirectoryEntry[]> {
  const [companies, users] = await Promise.all([
    apiClient.get<Company[]>("/company", { signal }),
    fetchAllCompanyUsers(signal),
  ]);
  const usersById = new Map(users.map((user) => [user.userId, user]));

  return companies.map((company) => ({
    company,
    user: usersById.get(company.companyId) ?? null,
  }));
}

async function fetchAllCompanyUsers(signal: AbortSignal): Promise<User[]> {
  const users: User[] = [];

  // GET /user pagina internamente pero devuelve solo el array, sin metadata.
  // Se agotan páginas hasta recibir una de menos elementos que el page size.
  for (let page = 0; ; page += 1) {
    const batch = await apiClient.get<User[]>("/user", {
      params: { role: "EMPRESA", page, size: USER_PAGE_SIZE },
      signal,
    });

    users.push(...batch);
    if (batch.length < USER_PAGE_SIZE) return users;
  }
}

async function fetchAdminCompanyDetail(
  companyId: string,
  signal: AbortSignal,
): Promise<AdminCompanyDetail | null> {
  const encodedId = encodeURIComponent(companyId);

  try {
    const [company, user] = await Promise.all([
      apiClient.get<Company>(`/company/${encodedId}`, { signal }),
      getOptionalUser(encodedId, signal),
    ]);

    return toAdminCompanyDetail({ company, user });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

async function getOptionalUser(
  encodedCompanyId: string,
  signal: AbortSignal,
): Promise<User | null> {
  try {
    return await apiClient.get<User>(`/user/${encodedCompanyId}`, { signal });
  } catch (error) {
    // El perfil sigue siendo mostrable si falta temporalmente su User.
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

function paginateAndFilter(
  directory: AdminCompanyDirectoryEntry[],
  filters: AdminCompanyFilters,
): Paginated<AdminCompanyRow> {
  const page = filters.page ?? 1;
  const perPage = filters.perPage ?? DEFAULT_PER_PAGE;
  const rows = directory.map(toAdminCompanyDetail).sort(compareCompanies);
  const filtered = filterRows(rows, filters);
  const lastPage = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(Math.max(page, 1), lastPage);
  const start = (safePage - 1) * perPage;

  return {
    items: filtered.slice(start, start + perPage),
    total: filtered.length,
    page: safePage,
    perPage,
  };
}

function toAdminCompanyDetail({
  company,
  user,
}: AdminCompanyDirectoryEntry): AdminCompanyDetail {
  return {
    id: company.companyId,
    name: company.name,
    email: user?.email ?? "—",
    industry: company.industry,
    location: formatDepartment(company.location),
    registeredAt: user?.registeredAt ?? null,
    // CompanyResponse resuelve este valor desde el User al construir la
    // respuesta, por lo que no depende de que el join de email haya salido.
    status: company.status,
    initials: initialsOf(company.name),
    description: company.description,
    webUrl: company.webUrl,
    linkedinUrl: company.linkedinUrl,
    reviewedAt: company.reviewedAt,
    adminComment: company.adminComment,
  };
}

function compareCompanies(a: AdminCompanyRow, b: AdminCompanyRow): number {
  return (
    (b.registeredAt ?? "").localeCompare(a.registeredAt ?? "") ||
    a.name.localeCompare(b.name, "es")
  );
}

function formatDepartment(department: string): string {
  return department
    .toLocaleLowerCase("es")
    .split("_")
    .map((word) => word.charAt(0).toLocaleUpperCase("es") + word.slice(1))
    .join(" ");
}

function initialsOf(name: string): string {
  const fromCapitals = name
    .split(" ")
    .filter((word) => /^[A-ZÁÉÍÓÚ]/.test(word))
    .slice(0, 2)
    .map((word) => word[0])
    .join("");

  return (fromCapitals || name.trim()[0] || "").toUpperCase();
}

function filterRows(
  rows: AdminCompanyRow[],
  filters: AdminCompanyFilters,
): AdminCompanyRow[] {
  const search = filters.search?.trim().toLocaleLowerCase("es");

  return rows.filter((row) => {
    if (filters.statuses?.length && !filters.statuses.includes(row.status)) return false;
    if (filters.industries?.length && !filters.industries.includes(row.industry)) return false;
    if (filters.locations?.length && !filters.locations.includes(row.location)) return false;
    if (search) {
      const haystack = `${row.name} ${row.email}`.toLocaleLowerCase("es");
      if (!haystack.includes(search)) return false;
    }
    return true;
  });
}
