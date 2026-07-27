"use client";

// Listado y detalle administrativo de empresas.
//
// 🔴 No hay endpoint todavía: `CompanyResponse` no expone `status` (A-18), que
// es justo lo que esta pantalla necesita para moderar. Esto arma las filas en
// memoria cruzando `MOCK_COMPANIES` con el `User` de la misma PK, igual que
// `use-pending-companies.ts`. Cuando exista el contrato, `fetchAdminCompanies`
// pasa a llamar a apiClient y el resto no cambia.
//
// Se usan los fixtures compartidos y NO un mock propio del dominio a propósito:
// la moderación (`use-review-account.ts`) muta el `status` en
// `MOCK_COMPANY_USERS`, así que un dataset paralelo nunca reflejaría el cambio.

import { useQuery } from "@tanstack/react-query";

import { MOCK_COMPANIES, MOCK_COMPANY_USERS, MOCK_USERS } from "@/lib/fixtures";
import type {
  AdminCompanyDetail,
  AdminCompanyFilters,
  AdminCompanyRow,
} from "@/features/moderacion/types";
import type { Paginated, User } from "@/types";

const DEFAULT_PER_PAGE = 10;

export function adminCompaniesQueryKey(filters: AdminCompanyFilters) {
  return ["moderacion", "empresas", filters] as const;
}

export function useAdminCompanies(filters: AdminCompanyFilters) {
  return useQuery({
    queryKey: adminCompaniesQueryKey(filters),
    queryFn: () => fetchAdminCompanies(filters),
  });
}

export function adminCompanyDetailQueryKey(companyId: string) {
  return ["moderacion", "empresas", "detalle", companyId] as const;
}

export function useAdminCompanyDetail(companyId: string) {
  return useQuery({
    queryKey: adminCompanyDetailQueryKey(companyId),
    queryFn: async (): Promise<AdminCompanyDetail | null> =>
      allCompanyDetails().find((company) => company.id === companyId) ?? null,
  });
}

/** Rubros presentes en los datos, para poblar el filtro. Va por `useQuery` y
 *  no por un `useMemo` sobre el mock para que el día que haya endpoint sea el
 *  mismo cambio que el resto. */
export function adminCompanyIndustriesQueryKey() {
  return ["moderacion", "empresas", "industrias"] as const;
}

export function useAdminCompanyIndustries() {
  return useQuery({
    queryKey: adminCompanyIndustriesQueryKey(),
    queryFn: async () =>
      Array.from(new Set(allCompanyDetails().map((company) => company.industry))).sort(),
  });
}

/** Ubicaciones presentes en los datos, para poblar el filtro. Mismo criterio
 *  que `useAdminCompanyIndustries`: por `useQuery` para que el día que haya
 *  endpoint sea el mismo cambio que el resto. */
export function adminCompanyLocationsQueryKey() {
  return ["moderacion", "empresas", "ubicaciones"] as const;
}

export function useAdminCompanyLocations() {
  return useQuery({
    queryKey: adminCompanyLocationsQueryKey(),
    queryFn: async () =>
      Array.from(new Set(allCompanyDetails().map((company) => company.location))).sort((a, b) =>
        a.localeCompare(b, "es"),
      ),
  });
}

async function fetchAdminCompanies(
  filters: AdminCompanyFilters,
): Promise<Paginated<AdminCompanyRow>> {
  const page = filters.page ?? 1;
  const perPage = filters.perPage ?? DEFAULT_PER_PAGE;

  const filtered = filterRows(allCompanyDetails(), filters);

  const start = (page - 1) * perPage;
  const items = filtered.slice(start, start + perPage);

  return { items, total: filtered.length, page, perPage };
}

/** Todos los `User` de rol EMPRESA: el de la sesión mock más los que solo
 *  existen como empresa registrada. */
function allCompanyUsers(): User[] {
  return [MOCK_USERS.EMPRESA, ...MOCK_COMPANY_USERS];
}

/** El detalle es el superset de la fila, así que se arma una sola vez y el
 *  listado usa el mismo objeto — no hay dos fuentes que se puedan desfasar. */
function allCompanyDetails(): AdminCompanyDetail[] {
  const users = allCompanyUsers();

  return MOCK_COMPANIES.map((company) => {
    const user = users.find((u) => u.userId === company.companyId);

    return {
      id: company.companyId,
      name: company.name,
      email: user?.email ?? "—",
      industry: company.industry,
      location: formatDepartment(company.location),
      registeredAt: user?.registeredAt ?? "",
      // El estado vive en `User`, no en `Company` (AGENTS.md, "Roles y control
      // de acceso"). Sin user asumimos PENDIENTE: es el estado con el que nace
      // toda cuenta, y es el conservador para moderar.
      status: user?.status ?? "PENDIENTE",
      initials: initialsOf(company.name),
      description: company.description,
      webUrl: company.webUrl,
      linkedinUrl: company.linkedinUrl,
    };
  });
}

/** `Department` llega en MAYÚSCULA con guiones bajos ("CERRO_LARGO"). Se
 *  formatea acá y no con un diccionario de 19 entradas porque el mapeo es
 *  mecánico; el diccionario de `register-form.tsx` es de otro dominio y no se
 *  puede importar. */
function formatDepartment(department: string): string {
  return department
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
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
  const search = filters.search?.trim().toLowerCase();

  return rows.filter((row) => {
    if (filters.statuses?.length && !filters.statuses.includes(row.status)) return false;
    if (filters.industries?.length && !filters.industries.includes(row.industry)) return false;
    if (filters.locations?.length && !filters.locations.includes(row.location)) return false;
    if (search) {
      const haystack = `${row.name} ${row.email}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });
}
