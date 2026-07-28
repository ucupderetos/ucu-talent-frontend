"use client";

// Datos de la tabla de "Postulantes" (vista empresa, cruzada a todas sus
// ofertas).
//
// ⚠️ ANDAMIO TEMPORAL: igual que `features/puestos/hooks/use-company-vacancies.ts`,
// esto simula un `GET` paginado y filtrado, pero resuelve todo en memoria
// sobre `lib/fixtures.ts`. TODO(api): cuando se conecte, esto pasa a
// `apiClient.get<VacancyApplicantResponse[]>("/vacancy-application", { vacancyId })`
// (docs/ENDPOINTS.md, sección 6) — la respuesta real ya trae `studentName`
// resuelto, sin `StudentProfile`/`User` completos (ver el aviso en
// `ApplicantRow`, `features/postulaciones/types.ts`). Acá se simula lo mismo:
// `studentName` sale de `MOCK_STUDENT_PROFILES`, sin tocar `MOCK_APPLICANT_USERS`.

import { useQuery } from "@tanstack/react-query";

import { MOCK_APPLICATIONS, MOCK_STUDENT_PROFILES, MOCK_VACANCIES } from "@/lib/fixtures";
import type { ApplicantFilters, ApplicantOrder, ApplicantRow } from "@/features/postulaciones/types";
import type { Paginated, StudentProfile, Vacancy, VacancyApplication } from "@/types";

const DEFAULT_PER_PAGE = 10;

/** @public para invalidación puntual futura (AGENTS.md). */
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

/** Junta `VacancyApplication` + nombre del postulante + nombre de la oferta,
 *  para las vacantes de esta empresa — mismos campos que `VacancyApplicantResponse`. */
function buildRows(companyId: string): ApplicantRow[] {
  const ownVacancyIds = new Set(
    MOCK_VACANCIES.filter((v) => v.companyId === companyId).map((v) => v.vacancyId),
  );
  const vacancyById = new Map<string, Vacancy>(MOCK_VACANCIES.map((v) => [v.vacancyId, v]));
  const profileById = new Map<string, StudentProfile>(
    MOCK_STUDENT_PROFILES.map((p) => [p.studentProfileId, p]),
  );

  return MOCK_APPLICATIONS.filter((application) => ownVacancyIds.has(application.vacancyId))
    .map((application) => toRow(application, vacancyById, profileById))
    .filter((row): row is ApplicantRow => row !== null);
}

function toRow(
  application: VacancyApplication,
  vacancyById: Map<string, Vacancy>,
  profileById: Map<string, StudentProfile>,
): ApplicantRow | null {
  const vacancy = vacancyById.get(application.vacancyId);
  const profile = profileById.get(application.studentProfileId);
  if (!vacancy || !profile) return null;

  return {
    application,
    studentName: `${profile.name} ${profile.surname}`,
    vacancyId: vacancy.vacancyId,
    vacancyName: vacancy.name,
  };
}

function filterRows(rows: ApplicantRow[], filters: ApplicantFilters): ApplicantRow[] {
  const search = filters.search?.trim().toLowerCase();

  return rows.filter((row) => {
    if (filters.vacancyIds?.length && !filters.vacancyIds.includes(row.vacancyId)) return false;
    if (filters.statuses?.length && !filters.statuses.includes(row.application.status)) return false;
    if (search && !row.studentName.toLowerCase().includes(search)) return false;
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
