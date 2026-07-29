"use client";

// Listado y detalle administrativo de empresas.
//
// El contrato entrega el perfil de empresa y la cuenta en recursos separados:
// `GET /company` aporta los datos del perfil y `GET /user?role=EMPRESA` aporta
// email, fecha de registro y el estado canónico de la cuenta. Se consultan en
// paralelo y se componen por la PK compartida (`companyId === userId`).
//
// El backend devuelve arrays sin paginar. La búsqueda, los filtros y la
// paginación visual se resuelven en Front sobre una única query estable para no
// repetir requests cada vez que cambia un filtro.

import { useQuery } from "@tanstack/react-query";

import type {
  AdminCompanyDetail,
  AdminCompanyFilters,
  AdminCompanyRow,
} from "@/features/moderacion/types";
import { apiClient, ApiError } from "@/lib/api-client";
import type { Company, Paginated, User } from "@/types";

const DEFAULT_PER_PAGE = 10;

export interface AdminCompanyDirectoryEntry {
  company: Company;
  user: User | null;
}

/** Query base del directorio. También la reutiliza la cola de empresas
 * pendientes para que ambas pantallas compartan datos y caché. */
export function adminCompaniesQueryKey() {
  return ["moderacion", "empresas"] as const;
}

export function useAdminCompanies(filters: AdminCompanyFilters) {
  return useQuery({
    queryKey: adminCompaniesQueryKey(),
    queryFn: ({ signal }) => fetchAdminCompanyDirectory(signal),
    select: (directory): Paginated<AdminCompanyRow> => paginateAndFilter(directory, filters),
  });
}

export function adminCompanyDetailQueryKey(companyId: string) {
  return [...adminCompaniesQueryKey(), "detalle", companyId] as const;
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
      Array.from(new Set(directory.map(({ company }) => company.industry))).sort((a, b) =>
        a.localeCompare(b, "es"),
      ),
  });
}

export function useAdminCompanyLocations() {
  return useQuery({
    queryKey: adminCompaniesQueryKey(),
    queryFn: ({ signal }) => fetchAdminCompanyDirectory(signal),
    select: (directory) =>
      Array.from(new Set(directory.map(({ company }) => formatDepartment(company.location)))).sort(
        (a, b) => a.localeCompare(b, "es"),
      ),
  });
}

/** Lectura compartida con `use-pending-companies.ts`. */
export async function fetchAdminCompanyDirectory(
  signal?: AbortSignal,
): Promise<AdminCompanyDirectoryEntry[]> {
  const [companies, users] = await Promise.all([
    apiClient.get<Company[]>("/company", { signal }),
    apiClient.get<User[]>("/user", { params: { role: "EMPRESA" }, signal }),
  ]);
  const usersById = new Map(users.map((user) => [user.userId, user] as const));

  return companies.map((company) => ({
    company,
    user: usersById.get(company.companyId) ?? null,
  }));
}

async function fetchAdminCompanyDetail(
  companyId: string,
  signal?: AbortSignal,
): Promise<AdminCompanyDetail | null> {
  const encodedCompanyId = encodeURIComponent(companyId);
  const companyRequest = apiClient.get<Company>(`/company/${encodedCompanyId}`, { signal });
  const userRequest = apiClient
    .get<User>(`/user/${encodedCompanyId}`, { signal })
    .catch((error: unknown) => {
      // La empresa sigue siendo mostrable si el perfil existe pero la cuenta
      // asociada no fue incluida por una inconsistencia temporal del backend.
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    });

  try {
    const [company, user] = await Promise.all([companyRequest, userRequest]);
    return toAdminCompanyDetail({ company, user });
  } catch (error) {
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
  const rows = directory.map(toAdminCompanyDetail);
  const filtered = filterRows(rows, filters);
  const start = (page - 1) * perPage;

  return {
    items: filtered.slice(start, start + perPage),
    total: filtered.length,
    page,
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
    // User.status es la fuente canónica. CompanyResponse lo duplica para que
    // el perfil pueda mostrarlo sin otra lectura; queda como fallback si la
    // composición administrativa no encuentra el User correspondiente.
    status: user?.status ?? company.status,
    initials: initialsOf(company.name),
    description: company.description,
    webUrl: company.webUrl,
    linkedinUrl: company.linkedinUrl,
    reviewedAt: company.reviewedAt,
    adminComment: company.adminComment,
  };
}

/** `Department` llega en MAYÚSCULA con guiones bajos ("CERRO_LARGO"). */
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
