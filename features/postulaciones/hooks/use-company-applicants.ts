"use client";

// Datos de la tabla de "Postulantes" (vista empresa, cruzada a TODAS sus
// ofertas).
//
// No existe un endpoint que devuelva de una todos los postulantes de la
// empresa: `GET /vacancy-application?vacancyId={id}` es por-vacante (empresa
// dueña). Se resuelve en dos pasadas: 1) las vacantes propias (`GET /vacancy`
// sin paginar + filtro por `companyId` en el cliente, mismo patrón que
// `features/puestos/hooks/use-company-vacancies.ts`), 2) por cada una, sus
// postulaciones. La respuesta real (`VacancyApplicationResponse`) NO trae
// `studentName` resuelto — se completa con `GET /student-profile/{id}` por
// cada `studentProfileId` único (1+N, mismo criterio que
// `use-my-applications.ts` con `Company`/`Area`). Ver el aviso en
// `ApplicantRow`, `features/postulaciones/types.ts`.

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import { MOCK_APPLICATIONS, MOCK_STUDENT_PROFILES, MOCK_VACANCIES } from "@/lib/fixtures";
import type { ApplicantFilters, ApplicantOrder, ApplicantRow } from "@/features/postulaciones/types";
import type { Paginated, StudentProfile, Vacancy, VacancyApplication } from "@/types";

const DEFAULT_PER_PAGE = 10;
const MOCK_ROLE = process.env.NEXT_PUBLIC_MOCK_SESSION;

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
    queryFn: ({ signal }) => fetchCompanyApplicants(companyId, filters, signal),
    enabled: Boolean(companyId),
  });
}

async function fetchCompanyApplicants(
  companyId: string | undefined,
  filters: ApplicantFilters,
  signal?: AbortSignal,
): Promise<Paginated<ApplicantRow>> {
  const page = filters.page ?? 1;
  const perPage = filters.perPage ?? DEFAULT_PER_PAGE;

  if (!companyId) return { items: [], total: 0, page, perPage };

  const rows = await buildRows(companyId, signal);
  const filtered = filterRows(rows, filters);
  const sorted = sortRows(filtered, filters.order);

  const start = (page - 1) * perPage;
  const items = sorted.slice(start, start + perPage);

  return { items, total: sorted.length, page, perPage };
}

/** Junta `VacancyApplication` + nombre del postulante (resuelto por
 *  `studentProfileId`) + nombre de la oferta, para TODAS las vacantes de esta
 *  empresa. */
async function buildRows(companyId: string, signal?: AbortSignal): Promise<ApplicantRow[]> {
  if (MOCK_ROLE) return buildRowsFromFixtures(companyId);

  const vacancies = await fetchCompanyVacancies(companyId, signal);
  const applications = await fetchApplicationsForVacancies(vacancies, signal);
  const profiles = await fetchStudentProfiles(
    Array.from(new Set(applications.map((application) => application.studentProfileId))),
    signal,
  );

  const vacancyById = new Map(vacancies.map((vacancy) => [vacancy.vacancyId, vacancy]));
  const profileById = new Map(profiles.map((profile) => [profile.studentProfileId, profile]));

  return applications
    .map((application) => toRow(application, vacancyById, profileById))
    .filter((row): row is ApplicantRow => row !== null);
}

function buildRowsFromFixtures(companyId: string): ApplicantRow[] {
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

/**
 * Vacantes propias de la empresa. Mismo patrón que
 * `use-company-vacancies.ts`: `GET /vacancy` no se pagina (A-04), así que se
 * filtra por `companyId` en el cliente.
 *
 * @public la reusa `use-company-vacancy-options.ts` (mismo dominio) para las
 * opciones del filtro de oferta.
 */
export async function fetchCompanyVacancies(
  companyId: string,
  signal?: AbortSignal,
): Promise<Vacancy[]> {
  const vacancies = await apiClient.get<Vacancy[]>("/vacancy", { signal });
  return vacancies.filter((vacancy) => vacancy.companyId === companyId);
}

async function fetchApplicationsForVacancies(
  vacancies: Vacancy[],
  signal?: AbortSignal,
): Promise<VacancyApplication[]> {
  const results = await Promise.all(
    vacancies.map((vacancy) => fetchApplicationsForVacancy(vacancy.vacancyId, signal)),
  );
  return results.flat();
}

async function fetchApplicationsForVacancy(
  vacancyId: string,
  signal?: AbortSignal,
): Promise<VacancyApplication[]> {
  try {
    return await apiClient.get<VacancyApplication[]>("/vacancy-application", {
      params: { vacancyId },
      signal,
    });
  } catch {
    // Una oferta puntual sin postulaciones/acceso no debe tirar abajo toda la lista.
    return [];
  }
}

async function fetchStudentProfiles(
  studentProfileIds: string[],
  signal?: AbortSignal,
): Promise<StudentProfile[]> {
  const profiles = await Promise.all(
    studentProfileIds.map((studentProfileId) => fetchStudentProfile(studentProfileId, signal)),
  );
  return profiles.filter((profile): profile is StudentProfile => profile !== null);
}

async function fetchStudentProfile(
  studentProfileId: string,
  signal?: AbortSignal,
): Promise<StudentProfile | null> {
  try {
    return await apiClient.get<StudentProfile>(`/student-profile/${studentProfileId}`, { signal });
  } catch {
    // Un perfil puntual sin acceso no debe tirar abajo toda la lista.
    return null;
  }
}

/** Nombre de respaldo cuando no se pudo resolver el `StudentProfile` del
 *  postulante (falló su `GET /student-profile/{id}`). Se muestra la fila igual
 *  —con la oferta, el estado y la fecha, que sí tenemos— para no ocultarle a la
 *  empresa que ese alumno se postuló. Ver `fetchStudentProfile`. */
const UNRESOLVED_APPLICANT_NAME = "Postulante (perfil no disponible)";

function toRow(
  application: VacancyApplication,
  vacancyById: Map<string, Vacancy>,
  profileById: Map<string, StudentProfile>,
): ApplicantRow | null {
  const vacancy = vacancyById.get(application.vacancyId);
  // La oferta sale de la lista de vacantes propias ya traída: si no está, la
  // postulación no es de esta empresa (o la vacante no se pudo cargar) y se
  // omite. El perfil, en cambio, NO se descarta si falla su fetch: se muestra
  // la fila con un nombre de respaldo, para no perder al postulante de la vista.
  if (!vacancy) return null;

  const profile = profileById.get(application.studentProfileId);

  return {
    application,
    studentName: profile ? `${profile.name} ${profile.surname}` : UNRESOLVED_APPLICANT_NAME,
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
