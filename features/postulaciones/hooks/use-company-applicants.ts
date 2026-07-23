"use client";

// Datos de la tabla de "Postulantes" (vista empresa, cruzada a todas sus
// ofertas).
//
// ⚠️ ANDAMIO TEMPORAL: igual que `features/puestos/hooks/use-company-vacancies.ts`,
// esto simula un `GET` paginado y filtrado, pero resuelve todo en memoria
// sobre `lib/fixtures.ts`. TODO(api): cuando el contrato de `vacancy-application`
// exista, esto pasa a `apiClient.get<Paginated<ApplicantRow>>(...)`.

import { useQuery } from "@tanstack/react-query";

import {
  MOCK_APPLICANT_USERS,
  MOCK_APPLICATIONS,
  MOCK_STUDENT_PROFILES,
  MOCK_VACANCIES,
} from "@/lib/fixtures";
import type { ApplicantFilters, ApplicantOrder, ApplicantRow } from "@/features/postulaciones/types";
import type { Paginated, StudentProfile, User, Vacancy, VacancyApplication } from "@/types";

const DEFAULT_PER_PAGE = 10;

export function companyApplicantsQueryKey(
  companyId: string | undefined,
  filters: ApplicantFilters,
) {
  return ["postulantes", "empresa", companyId, filters] as const;
}

export function useCompanyApplicants(
  companyId: string | undefined,
  filters: ApplicantFilters,
) {
  return useQuery({
    queryKey: companyApplicantsQueryKey(companyId, filters),
    queryFn: () => fetchCompanyApplicants(companyId, filters),
    enabled: Boolean(companyId),
  });
}

async function fetchCompanyApplicants(
  companyId: string | undefined,
  filters: ApplicantFilters,
): Promise<Paginated<ApplicantRow>> {
  const page = filters.page ?? 1;
  const perPage = filters.perPage ?? DEFAULT_PER_PAGE;

  if (!companyId) return { items: [], total: 0, page, perPage };

  const rows = buildRows(companyId);
  const filtered = filterRows(rows, filters);
  const sorted = sortRows(filtered, filters.order);

  const start = (page - 1) * perPage;
  const items = sorted.slice(start, start + perPage);

  return { items, total: sorted.length, page, perPage };
}

/** Junta `VacancyApplication` + `StudentProfile` + `User` + nombre de la
 *  oferta para las vacantes de esta empresa. */
function buildRows(companyId: string): ApplicantRow[] {
  const ownVacancyIds = new Set(
    MOCK_VACANCIES.filter((v) => v.companyId === companyId).map((v) => v.vacancyId),
  );
  const vacancyById = new Map<string, Vacancy>(MOCK_VACANCIES.map((v) => [v.vacancyId, v]));
  const profileById = new Map<string, StudentProfile>(
    MOCK_STUDENT_PROFILES.map((p) => [p.studentProfileId, p]),
  );
  const userById = new Map<string, User>(MOCK_APPLICANT_USERS.map((u) => [u.userId, u]));

  return MOCK_APPLICATIONS.filter((application) => ownVacancyIds.has(application.vacancyId))
    .map((application) => toRow(application, vacancyById, profileById, userById))
    .filter((row): row is ApplicantRow => row !== null);
}

function toRow(
  application: VacancyApplication,
  vacancyById: Map<string, Vacancy>,
  profileById: Map<string, StudentProfile>,
  userById: Map<string, User>,
): ApplicantRow | null {
  const vacancy = vacancyById.get(application.vacancyId);
  const profile = profileById.get(application.studentProfileId);
  const user = userById.get(application.studentProfileId);
  if (!vacancy || !profile || !user) return null;

  return {
    application,
    profile,
    user,
    vacancyId: vacancy.vacancyId,
    vacancyName: vacancy.name,
  };
}

function filterRows(rows: ApplicantRow[], filters: ApplicantFilters): ApplicantRow[] {
  const search = filters.search?.trim().toLowerCase();

  return rows.filter((row) => {
    if (filters.vacancyIds?.length && !filters.vacancyIds.includes(row.vacancyId)) return false;
    if (filters.statuses?.length && !filters.statuses.includes(row.application.status)) return false;
    if (search) {
      const haystack = `${row.profile.name} ${row.profile.surname} ${row.user.email}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });
}

function sortRows(rows: ApplicantRow[], order: ApplicantOrder = "recent"): ApplicantRow[] {
  const sorted = [...rows];
  const appliedAt = (row: ApplicantRow) => new Date(row.application.appliedAt).getTime();

  return order === "oldest"
    ? sorted.sort((a, b) => appliedAt(a) - appliedAt(b))
    : sorted.sort((a, b) => appliedAt(b) - appliedAt(a));
}
