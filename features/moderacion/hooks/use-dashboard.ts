"use client";

// El backend no expone un payload único para el dashboard. Este hook compone
// los endpoints administrativos disponibles y mantiene un solo estado de
// carga para toda la pantalla.

import { useQuery } from "@tanstack/react-query";

import type {
  ApplicationStatusSummary,
  DashboardStat,
  PendingCompanyValidation,
  RecentActivityItem,
  RecentVacancy,
} from "@/features/moderacion/types";
import { apiClient } from "@/lib/api-client";
import type { Company, User, Vacancy, VacancyApplication } from "@/types";

interface AdminDashboardData {
  stats: DashboardStat[];
  recentVacancies: RecentVacancy[];
  pendingValidations: PendingCompanyValidation[];
  recentActivity: RecentActivityItem[];
  applicationsByStatus: ApplicationStatusSummary[];
}

interface AccountStatusSummary {
  total: number;
  pendiente: number;
  aprobado: number;
  rechazado: number;
}

interface VacancyStatusSummary {
  total: number;
  pendiente: number;
  publicado: number;
  finalizado: number;
}

interface ApplicationStatusSummaryResponse {
  total: number;
  pendiente: number;
  visto: number;
  finalizado: number;
}

interface SpringPage<T> {
  content: T[];
}

const USER_PAGE_SIZE = 100;
const RECENT_VACANCIES_LIMIT = 5;

/** @public para invalidar el dashboard después de una acción de moderación. */
export function dashboardQueryKey() {
  return ["moderacion", "dashboard"] as const;
}

export function useDashboard() {
  return useQuery({
    queryKey: dashboardQueryKey(),
    queryFn: ({ signal }) => fetchDashboard(signal),
  });
}

async function fetchDashboard(signal: AbortSignal): Promise<AdminDashboardData> {
  const [
    companySummary,
    studentSummary,
    vacancySummary,
    applicationSummary,
    companies,
    pendingCompanyUsers,
    recentVacancyPage,
    applications,
  ] = await Promise.all([
    apiClient.get<AccountStatusSummary>("/company/status-summary", { signal }),
    apiClient.get<AccountStatusSummary>("/student-profile/status-summary", { signal }),
    apiClient.get<VacancyStatusSummary>("/vacancy/status-summary", { signal }),
    apiClient.get<ApplicationStatusSummaryResponse>(
      "/vacancy-application/status-summary",
      { signal },
    ),
    apiClient.get<Company[]>("/company", { signal }),
    fetchAllPendingCompanyUsers(signal),
    apiClient.get<SpringPage<Vacancy>>("/vacancy/search", {
      params: {
        sortBy: "PUBLICATION_DATE",
        sortDirection: "DESC",
        page: 0,
        size: RECENT_VACANCIES_LIMIT,
        deleted: false,
      },
      signal,
    }),
    // El contrato no ofrece conteos por vacante para ADMIN. Hasta que el
    // backend los agregue, el listado global es la única fuente real para
    // calcular cuántas postulaciones tiene cada una de las cinco ofertas.
    apiClient.get<VacancyApplication[]>("/vacancy-application", { signal }),
  ]);

  return {
    stats: buildStats(companySummary, studentSummary, vacancySummary, applicationSummary),
    recentVacancies: buildRecentVacancies(
      recentVacancyPage.content,
      companies,
      applications,
    ),
    pendingValidations: buildPendingValidations(companies, pendingCompanyUsers),
    // No existe un endpoint de actividad general. /audit es de auditoría
    // interna y no representa altas/postulaciones de todos los dominios.
    recentActivity: [],
    applicationsByStatus: [
      { status: "PENDIENTE", label: "Pendientes", count: applicationSummary.pendiente },
      { status: "VISTO", label: "Vistas", count: applicationSummary.visto },
      { status: "FINALIZADO", label: "Finalizadas", count: applicationSummary.finalizado },
    ],
  };
}

async function fetchAllPendingCompanyUsers(signal: AbortSignal): Promise<User[]> {
  const users: User[] = [];

  for (let page = 0; ; page += 1) {
    const batch = await apiClient.get<User[]>("/user", {
      params: {
        role: "EMPRESA",
        status: "PENDIENTE",
        page,
        size: USER_PAGE_SIZE,
      },
      signal,
    });

    users.push(...batch);
    if (batch.length < USER_PAGE_SIZE) return users;
  }
}

function buildStats(
  companySummary: AccountStatusSummary,
  studentSummary: AccountStatusSummary,
  vacancySummary: VacancyStatusSummary,
  applicationSummary: ApplicationStatusSummaryResponse,
): DashboardStat[] {
  const formatNumber = new Intl.NumberFormat("es-UY").format;

  return [
    {
      id: "companies",
      title: "Empresas registradas",
      value: formatNumber(companySummary.total),
      description: `${formatNumber(companySummary.pendiente)} pendientes`,
    },
    {
      id: "vacancies",
      title: "Ofertas publicadas",
      value: formatNumber(vacancySummary.publicado),
      description: `${formatNumber(vacancySummary.total)} ofertas totales`,
    },
    {
      id: "applications",
      title: "Postulaciones",
      value: formatNumber(applicationSummary.total),
      description: `${formatNumber(applicationSummary.pendiente)} pendientes`,
    },
    {
      id: "users",
      title: "Usuarios registrados",
      // Los usuarios del producto son estudiantes y empresas; las cuentas
      // administrativas son internas y no tienen un resumen público.
      value: formatNumber(studentSummary.total + companySummary.total),
      description: `${formatNumber(studentSummary.total)} estudiantes · ${formatNumber(companySummary.total)} empresas`,
    },
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
  pendingUsers: User[],
): PendingCompanyValidation[] {
  const usersById = new Map(pendingUsers.map((user) => [user.userId, user]));

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
