"use client";

// tabla de "Postulaciones" (vista admin).
//
// GET /vacancy-application no tiene un "traeme todas" sin filtro, asi que
// pedimos una vez por cada status del enum y mergeamos. la respuesta viene
// pelada (sin nombre de alumno, oferta ni empresa), asi que cruzamos con
// student-profile, user (para el email), vacancy y company — todo fetch-all,
// mismo criterio que usamos en el resto de moderacion.

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import type {
  AdminApplicationFilters,
  AdminApplicationOrder,
  AdminApplicationRow,
} from "@/features/moderacion/types";
import type {
  Company,
  Paginated,
  StudentProfile,
  User,
  Vacancy,
  VacancyApplication,
  VacancyApplicationStatus,
} from "@/types";

const DEFAULT_PER_PAGE = 10;
const ALL_STATUSES: VacancyApplicationStatus[] = ["PENDIENTE", "VISTO", "FINALIZADO"];

/** @public para invalidación puntual futura (`docs/agents/data-fetching.md`). */
export function applicationsQueryKey(filters: AdminApplicationFilters) {
  return ["moderacion", "postulaciones", filters] as const;
}

export function useApplications(filters: AdminApplicationFilters) {
  return useQuery({
    queryKey: applicationsQueryKey(filters),
    queryFn: () => fetchApplications(filters),
  });
}

async function fetchApplications(
  filters: AdminApplicationFilters,
): Promise<Paginated<AdminApplicationRow>> {
  const page = filters.page ?? 1;
  const perPage = filters.perPage ?? DEFAULT_PER_PAGE;

  const [applicationsByStatus, profiles, users, vacancies, companies] = await Promise.all([
    Promise.all(
      ALL_STATUSES.map((status) =>
        apiClient.get<VacancyApplication[]>("/vacancy-application", { params: { status } }),
      ),
    ),
    apiClient.get<StudentProfile[]>("/student-profile"),
    apiClient.get<User[]>("/user", { params: { role: "ALUMNO" } }),
    apiClient.get<Vacancy[]>("/vacancy"),
    apiClient.get<Company[]>("/company"),
  ]);

  const profilesById = new Map(profiles.map((p) => [p.studentProfileId, p]));
  const usersById = new Map(users.map((u) => [u.userId, u]));
  const vacanciesById = new Map(vacancies.map((v) => [v.vacancyId, v]));
  const companiesById = new Map(companies.map((c) => [c.companyId, c]));

  const rows = applicationsByStatus
    .flat()
    .map((application) => toRow(application, profilesById, usersById, vacanciesById, companiesById))
    .filter((row): row is AdminApplicationRow => row !== null);
  const filtered = filterRows(rows, filters);
  const sorted = sortRows(filtered, filters.order);

  const start = (page - 1) * perPage;
  const items = sorted.slice(start, start + perPage);

  return { items, total: sorted.length, page, perPage };
}

/** null si falta el perfil o la oferta — no deberia pasar con la pk
 *  compartida, pero asi no rompemos la tabla entera por un dato huerfano. */
function toRow(
  application: VacancyApplication,
  profilesById: Map<string, StudentProfile>,
  usersById: Map<string, User>,
  vacanciesById: Map<string, Vacancy>,
  companiesById: Map<string, Company>,
): AdminApplicationRow | null {
  const profile = profilesById.get(application.studentProfileId);
  const vacancy = vacanciesById.get(application.vacancyId);
  if (!profile || !vacancy) return null;

  const user = usersById.get(application.studentProfileId);
  const company = companiesById.get(vacancy.companyId);

  return {
    ...application,
    studentName: profile.name,
    studentSurname: profile.surname,
    studentEmail: user?.email ?? "—",
    vacancyName: vacancy.name,
    companyId: company?.companyId ?? null,
    companyName: company?.name ?? "—",
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
