"use client";

// Datos del dashboard de Admin ("Centro de Gestión").
//
// 🔴 No hay endpoint de métricas agregadas todavía (ver aviso en
// features/moderacion/types.ts). Esto simula un GET único que devuelve todo el
// payload de la pantalla, resolviendo en memoria sobre
// features/moderacion/data/dashboard-mock.ts. Cuando exista el contrato,
// fetchDashboard() pasa a llamar a apiClient.get<AdminDashboard>(...) y no
// cambia nada más: los componentes ya consumen este hook, no los mocks.
//
// Va todo en una sola query y no una por card a propósito: son 5 bloques de la
// misma pantalla que se muestran juntos, así que un único estado de carga
// evita que el dashboard aparezca por pedazos.

import { useQuery } from "@tanstack/react-query";

import {
  MOCK_APPLICATIONS_BY_STATUS,
  MOCK_DASHBOARD_STATS,
  MOCK_PENDING_VALIDATIONS,
  MOCK_RECENT_ACTIVITY,
  MOCK_RECENT_VACANCIES,
} from "@/features/moderacion/data/dashboard-mock";
import type {
  ApplicationStatusSummary,
  DashboardStat,
  PendingCompanyValidation,
  RecentActivityItem,
  RecentVacancy,
} from "@/features/moderacion/types";

export interface AdminDashboardData {
  stats: DashboardStat[];
  recentVacancies: RecentVacancy[];
  pendingValidations: PendingCompanyValidation[];
  recentActivity: RecentActivityItem[];
  applicationsByStatus: ApplicationStatusSummary[];
}

export function dashboardQueryKey() {
  return ["moderacion", "dashboard"] as const;
}

export function useDashboard() {
  return useQuery({
    queryKey: dashboardQueryKey(),
    queryFn: fetchDashboard,
  });
}

async function fetchDashboard(): Promise<AdminDashboardData> {
  return {
    stats: MOCK_DASHBOARD_STATS,
    recentVacancies: MOCK_RECENT_VACANCIES,
    pendingValidations: MOCK_PENDING_VALIDATIONS,
    recentActivity: MOCK_RECENT_ACTIVITY,
    applicationsByStatus: MOCK_APPLICATIONS_BY_STATUS,
  };
}
