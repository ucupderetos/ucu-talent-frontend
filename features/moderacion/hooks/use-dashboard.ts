"use client";

// El backend no expone un payload único para el dashboard. Este hook trae los
// listados administrativos completos; los componentes calculan las métricas
// sobre esas fuentes para que coincidan con los registros visibles.

import { useQuery } from "@tanstack/react-query";

import type {
  ApplicationStatusSummary,
  DashboardStatsSource,
  PendingCompanyValidation,
  RecentActivityItem,
  RecentVacancy,
} from "@/features/moderacion/types";
import { apiClient } from "@/lib/api-client";
import type { Company, User, Vacancy, VacancyApplication } from "@/types";

interface AdminDashboardData {
  statsSource: DashboardStatsSource;
  recentVacancies: RecentVacancy[];
  pendingValidations: PendingCompanyValidation[];
  recentActivity: RecentActivityItem[];
  applicationsByStatus: ApplicationStatusSummary[];
}

const USER_PAGE_SIZE = 100;
const RECENT_VACANCIES_LIMIT = 5;

/** @public para invalidar el dashboard después de una acción de moderación. */
export function dashboardQueryKey() {
  return ["moderacion", "dashboard", "v2"] as const;
}

export function useDashboard() {
  return useQuery({
    queryKey: dashboardQueryKey(),
    queryFn: ({ signal }) => fetchDashboard(signal),
    // Las altas pueden ocurrir desde otra sesión/rol y no invalidan esta
    // caché local; al volver al dashboard se necesita un snapshot actual.
    refetchOnMount: "always",
  });
}

async function fetchDashboard(signal: AbortSignal): Promise<AdminDashboardData> {
  const [companies, users, vacancies, applications] = await Promise.all([
    apiClient.get<Company[]>("/company", { signal }),
    fetchAllUsers(signal),
    apiClient.get<Vacancy[]>("/vacancy", { signal }),
    apiClient.get<VacancyApplication[]>("/vacancy-application", { signal }),
  ]);
  const visibleVacancies = vacancies.filter((vacancy) => !vacancy.deleted);
  const recentVacancies = [...visibleVacancies]
    .sort(compareVacanciesByMostRecent)
    .slice(0, RECENT_VACANCIES_LIMIT);

  return {
    statsSource: { companies, vacancies, applications, users },
    recentVacancies: buildRecentVacancies(recentVacancies, companies, applications),
    pendingValidations: buildPendingValidations(companies, users),
    // No existe un endpoint de actividad general. /audit es de auditoría
    // interna y no representa altas/postulaciones de todos los dominios.
    recentActivity: [],
    applicationsByStatus: buildApplicationsByStatus(applications),
  };
}

async function fetchAllUsers(signal: AbortSignal): Promise<User[]> {
  const usersById = new Map<string, User>();

  for (let page = 0; ; page += 1) {
    const batch = await apiClient.get<User[]>("/user", {
      params: {
        page,
        size: USER_PAGE_SIZE,
      },
      signal,
    });

    // El endpoint no define un orden estable. El backend debería agregarlo
    // para garantizar el recorrido ante altas concurrentes; mientras tanto,
    // deduplicar por PK evita sobrecontar si una fila aparece en dos páginas.
    for (const user of batch) usersById.set(user.userId, user);

    if (batch.length < USER_PAGE_SIZE) return [...usersById.values()];
  }
}

function compareVacanciesByMostRecent(a: Vacancy, b: Vacancy): number {
  const publicationDateOrder = b.publicationDate.localeCompare(a.publicationDate);
  if (publicationDateOrder !== 0) return publicationDateOrder;
  return b.createdAt.localeCompare(a.createdAt);
}

function buildApplicationsByStatus(
  applications: VacancyApplication[],
): ApplicationStatusSummary[] {
  const counts: Record<VacancyApplication["status"], number> = {
    PENDIENTE: 0,
    VISTO: 0,
    FINALIZADO: 0,
  };

  for (const application of applications) counts[application.status] += 1;

  return [
    { status: "PENDIENTE", label: "Pendientes", count: counts.PENDIENTE },
    { status: "VISTO", label: "Vistas", count: counts.VISTO },
    { status: "FINALIZADO", label: "Finalizadas", count: counts.FINALIZADO },
  ];
}

function buildRecentVacancies(
  vacancies: Vacancy[],
  companies: Company[],
  applications: VacancyApplication[],
): RecentVacancy[] {
  const companyNames = new Map(
    companies.map((company) => [company.companyId, company.name]),
  );
  const applicationCounts = new Map<string, number>();

  for (const application of applications) {
    applicationCounts.set(
      application.vacancyId,
      (applicationCounts.get(application.vacancyId) ?? 0) + 1,
    );
  }

  return vacancies.map((vacancy) => ({
    vacancyId: vacancy.vacancyId,
    name: vacancy.name,
    companyName: companyNames.get(vacancy.companyId) ?? "Empresa no disponible",
    publicationDate: vacancy.publicationDate,
    applicationCount: applicationCounts.get(vacancy.vacancyId) ?? 0,
    status: vacancy.status,
  }));
}

function buildPendingValidations(
  companies: Company[],
  users: User[],
): PendingCompanyValidation[] {
  // `Company.status` también alimenta la tarjeta. User se usa solo para la
  // fecha de registro, evitando cruzar dos snapshots distintos del estado.
  const companyUsers = users.filter((user) => user.role === "EMPRESA");
  const usersById = new Map(companyUsers.map((user) => [user.userId, user]));

  return companies
    .filter((company) => company.status === "PENDIENTE" && usersById.has(company.companyId))
    .map((company) => ({
      companyId: company.companyId,
      name: company.name,
      industry: company.industry,
      registeredAt: usersById.get(company.companyId)!.registeredAt,
    }))
    .sort((a, b) => b.registeredAt.localeCompare(a.registeredAt));
}
