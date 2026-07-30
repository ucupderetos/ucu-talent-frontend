"use client";

// ✅ `GET /admin/dashboard` (rol ADMIN): totales y listados de la pantalla
// inicial en una sola request. Reemplaza al enfoque anterior (traer los
// listados administrativos completos y calcular las métricas acá) — ver el
// aviso en `features/moderacion/types.ts`.

import { useQuery } from "@tanstack/react-query";

import type {
  AdminDashboardResponse,
  ApplicationStatusSummary,
  DashboardStat,
  DashboardStatId,
  PendingCompanyValidation,
  RecentActivityItem,
  RecentVacancy,
} from "@/features/moderacion/types";
import { apiClient } from "@/lib/api-client";
import type { VacancyApplicationStatus } from "@/types";

interface AdminDashboardData {
  stats: DashboardStat[];
  recentVacancies: RecentVacancy[];
  pendingValidations: PendingCompanyValidation[];
  recentActivity: RecentActivityItem[];
  applicationsByStatus: ApplicationStatusSummary[];
}

const NUMBER_FORMAT = new Intl.NumberFormat("es-UY");

const APPLICATION_STATUS_LABEL: Record<VacancyApplicationStatus, string> = {
  PENDIENTE: "Pendientes",
  VISTO: "Vistas",
  FINALIZADO: "Finalizadas",
};

// El orden de la fila superior de métricas, ya que `StatsGrid` los pinta en
// el orden en que llegan.
const STAT_ORDER: DashboardStatId[] = ["companies", "vacancies", "applications", "users"];

/** @public para invalidar el dashboard después de una acción de moderación. */
export function dashboardQueryKey() {
  return ["moderacion", "dashboard", "v3"] as const;
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
  const response = await apiClient.get<AdminDashboardResponse>("/admin/dashboard", { signal });

  return {
    stats: buildStats(response),
    recentVacancies: response.recentVacancies,
    pendingValidations: response.pendingCompanies,
    // No existe un endpoint de actividad general. /audit es de auditoría
    // interna y no representa altas/postulaciones de todos los dominios.
    recentActivity: [],
    applicationsByStatus: buildApplicationsByStatus(response.applicationStatusSummary),
  };
}

function buildStats({ counts }: AdminDashboardResponse): DashboardStat[] {
  const stats: Record<DashboardStatId, DashboardStat> = {
    companies: {
      id: "companies",
      title: "Empresas registradas",
      value: counts.companies.total,
      description: formatCount(counts.companies.pendientes, "pendiente", "pendientes"),
    },
    vacancies: {
      id: "vacancies",
      title: "Ofertas publicadas",
      value: counts.vacancies.publicadas,
      description: formatCount(counts.vacancies.total, "oferta total", "ofertas totales"),
    },
    applications: {
      id: "applications",
      title: "Postulaciones",
      value: counts.applications.total,
      description: formatCount(counts.applications.pendientes, "pendiente", "pendientes"),
    },
    users: {
      id: "users",
      title: "Usuarios registrados",
      value: counts.users.total,
      description: [
        formatCount(counts.users.alumnos, "cuenta de estudiante", "cuentas de estudiantes"),
        formatCount(counts.users.empresas, "cuenta de empresa", "cuentas de empresas"),
        formatCount(counts.users.admins, "cuenta de administrador", "cuentas de administradores"),
      ].join(" · "),
    },
  };

  return STAT_ORDER.map((id) => stats[id]);
}

function buildApplicationsByStatus(
  summary: AdminDashboardResponse["applicationStatusSummary"],
): ApplicationStatusSummary[] {
  const counts: Record<VacancyApplicationStatus, number> = {
    PENDIENTE: 0,
    VISTO: 0,
    FINALIZADO: 0,
  };

  // El contrato dice que `applicationStatusSummary` SIEMPRE trae los 3 estados,
  // aunque den 0 (ver A-28 en docs/agents/open-questions.md). Se parte igual de
  // un record en 0 en vez de mapear el array directo: si el backend algún día
  // omite un estado vacío, el donut sigue mostrando los 3 del enum en vez de
  // perder una cuña en silencio.
  for (const item of summary) counts[item.status] = item.count;

  return (Object.keys(counts) as VacancyApplicationStatus[]).map((status) => ({
    status,
    label: APPLICATION_STATUS_LABEL[status],
    count: counts[status],
  }));
}

function formatCount(count: number, singular: string, plural: string): string {
  return `${NUMBER_FORMAT.format(count)} ${count === 1 ? singular : plural}`;
}
