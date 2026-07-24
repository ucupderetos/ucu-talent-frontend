"use client";

// Orquestador del dashboard de Admin ("Centro de Gestión"): pide los datos y
// reparte a los componentes de presentación, que son tontos y reciben props.
// La page.tsx solo renderiza esto. Mismo patrón que `applications-view.tsx`.

import { EmptyState } from "@/components/layout/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboard } from "@/features/moderacion/hooks/use-dashboard";
import { ApplicationsByStatus } from "@/features/moderacion/components/dashboard/applications-by-status";
import { PendingValidations } from "@/features/moderacion/components/dashboard/pending-validations";
import { RecentActivity } from "@/features/moderacion/components/dashboard/recent-activity";
import { RecentVacanciesTable } from "@/features/moderacion/components/dashboard/recent-vacancies-table";
import { StatsGrid } from "@/features/moderacion/components/dashboard/stats-grid";

export function AdminDashboard() {
  const { data, isLoading, isError } = useDashboard();

  return (
    <div className="flex flex-col gap-6">
      {isLoading && <DashboardSkeleton />}

      {!isLoading && isError && (
        <EmptyState
          title="No pudimos cargar el panel"
          description="Revisá tu conexión y volvé a intentar."
        />
      )}

      {!isLoading && !isError && data && (
        <>
          <StatsGrid stats={data.stats} />

          <div className="grid gap-6 xl:grid-cols-2">
            <RecentActivity activities={data.recentActivity} />
            <ApplicationsByStatus statuses={data.applicationsByStatus} />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
            <RecentVacanciesTable vacancies={data.recentVacancies} />
            <PendingValidations validations={data.pendingValidations} />
          </div>
        </>
      )}
    </div>
  );
}

/** Mismo tamaño y radio que el contenido final, no un spinner centrado
 *  (AGENTS.md, "Estados de los componentes"). */
function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}
